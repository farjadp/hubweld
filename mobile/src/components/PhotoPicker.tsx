import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import { Camera, X } from "lucide-react-native";
import { RemoteImage } from "@/components/RemoteImage";
import { Label, Text, colors } from "@/components/ui";
import { chooseSource, pickImages, uploadImage, type UploadKind } from "@/lib/upload";
import { errorMessage } from "@/lib/api";

/**
 * A row of uploaded photos with an "add" tile. Each photo is uploaded as soon
 * as it is picked, so `value` only ever holds server URLs.
 */
export function PhotoPicker({
  label,
  value,
  onChange,
  kind,
  max = 8,
  onBusyChange,
}: {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  kind: UploadKind;
  max?: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [pending, setPending] = useState(0);

  async function add() {
    const source = await chooseSource();
    if (!source) return;
    const room = max - value.length;
    const assets = (await pickImages(source, { multiple: room > 1, limit: room })).slice(0, room);
    if (!assets.length) return;
    setPending((n) => n + assets.length);
    onBusyChange?.(true);
    const urls: string[] = [];
    for (const a of assets) {
      try {
        urls.push(await uploadImage(a, kind));
      } catch (e) {
        Alert.alert("A photo didn't upload", errorMessage(e));
      } finally {
        setPending((n) => n - 1);
      }
    }
    onBusyChange?.(false);
    if (urls.length) onChange([...value, ...urls]);
  }

  return (
    <View>
      {label ? <Label className="mb-1.5">{label}</Label> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {value.map((url) => (
          <View key={url} className="h-24 w-24">
            <RemoteImage uri={url} label="Photo" className="h-24 w-24 rounded-sm" />
            <Pressable
              accessibilityLabel="Remove photo"
              hitSlop={8}
              onPress={() => onChange(value.filter((u) => u !== url))}
              className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-slate-900/80"
            >
              <X size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {Array.from({ length: pending }).map((_, i) => (
          <View key={`p${i}`} className="h-24 w-24 items-center justify-center rounded-sm bg-recess">
            <ActivityIndicator color={colors.brand} />
          </View>
        ))}
        {value.length + pending < max ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={add}
            className="h-24 w-24 items-center justify-center gap-1 rounded-sm border border-dashed border-slate-400 bg-panel active:bg-raised"
          >
            <Camera size={22} color={colors.slate500} />
            <Text className="text-[12px] text-slate-500">Add</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
