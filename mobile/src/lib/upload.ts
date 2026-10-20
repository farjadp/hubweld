import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { api } from "@/lib/api";

/**
 * Photos: pick or shoot, normalise, upload.
 *
 * The server accepts JPEG, PNG or WebP up to 5 MB. iPhones shoot HEIC and a
 * modern camera frame is far bigger than any screen shows, so every image is
 * re-encoded here as a JPEG no wider than 2000px before it leaves the phone.
 */

export type UploadKind = "avatar" | "gallery" | "product" | "job";

const MAX_EDGE = 2000;

async function ensurePermission(source: "camera" | "library"): Promise<boolean> {
  const res =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (res.granted) return true;
  Alert.alert(
    source === "camera" ? "Camera access is off" : "Photo access is off",
    "You can turn it on for HubWeld in Settings.",
    [
      { text: "Not now", style: "cancel" },
      { text: "Open Settings", onPress: () => void Linking.openSettings() },
    ]
  );
  return false;
}

/** Returns local URIs, or [] if the user cancelled or refused access. */
export async function pickImages(
  source: "camera" | "library",
  opts: { multiple?: boolean; limit?: number; square?: boolean } = {}
): Promise<ImagePicker.ImagePickerAsset[]> {
  if (!(await ensurePermission(source))) return [];
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.9,
    allowsEditing: !!opts.square && !opts.multiple,
    aspect: opts.square ? [1, 1] : undefined,
    allowsMultipleSelection: source === "library" && !!opts.multiple,
    selectionLimit: opts.limit ?? 0,
  };
  const res = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  return res.canceled ? [] : res.assets;
}

/** Ask "camera or library?" the platform-neutral way. */
export function chooseSource(): Promise<"camera" | "library" | null> {
  return new Promise((resolve) => {
    Alert.alert("Add a photo", undefined, [
      { text: "Take photo", onPress: () => resolve("camera") },
      { text: "Choose from library", onPress: () => resolve("library") },
      { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
    ], { cancelable: true, onDismiss: () => resolve(null) });
  });
}

/** Normalise one picked image and upload it. Resolves to the stored URL. */
export async function uploadImage(asset: ImagePicker.ImagePickerAsset, kind: UploadKind): Promise<string> {
  const ctx = ImageManipulator.manipulate(asset.uri);
  const longest = Math.max(asset.width, asset.height);
  if (longest > MAX_EDGE) {
    ctx.resize(asset.width >= asset.height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }
  const rendered = await ctx.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });

  const form = new FormData();
  // React Native's FormData takes a { uri, name, type } descriptor for files.
  form.append("file", { uri: saved.uri, name: `${kind}-${Date.now()}.jpg`, type: "image/jpeg" } as unknown as Blob);
  form.append("kind", kind);
  const { url } = await api<{ url: string }>("/api/profile/upload", { method: "POST", form });
  return url;
}
