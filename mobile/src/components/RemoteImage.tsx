import { View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { withUniwind } from "uniwind";
import { ImageOff } from "lucide-react-native";
import { absoluteUrl } from "@/lib/config";
import { colors } from "@/components/ui";

// expo-image is not a core component, so it needs the HOC to accept className.
const Image = withUniwind(ExpoImage);

/** Server image (relative or absolute URL) with a quiet placeholder. */
export function RemoteImage({ uri, className = "", label }: { uri: string | null | undefined; className?: string; label?: string }) {
  const src = absoluteUrl(uri);
  if (!src) {
    return (
      <View className={`items-center justify-center bg-recess ${className}`} accessibilityLabel={label ? `${label}, no image` : "No image"}>
        <ImageOff size={22} color={colors.slate400} />
      </View>
    );
  }
  return <Image source={{ uri: src }} className={className} contentFit="cover" transition={150} accessibilityLabel={label} />;
}
