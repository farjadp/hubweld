import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useResolveClassNames } from "uniwind";

/**
 * Scroll container for any screen with text inputs. It keeps the focused field
 * above the keyboard on both platforms — React Native's KeyboardAvoidingView
 * does not scroll to the field on Android, where an edge-to-edge window no
 * longer resizes for the keyboard, so a phone-number field near the bottom
 * ended up under the number pad.
 */
export function FormScroll({
  children,
  className = "flex-1 bg-ground",
  contentContainerClassName = "",
  contentContainerStyle,
  bottomOffset = 24,
}: {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomOffset?: number;
}) {
  // A third-party scroll view: resolve the classes to styles ourselves.
  const container = useResolveClassNames(contentContainerClassName);
  const outer = useResolveClassNames(className);
  return (
    <KeyboardAwareScrollView
      bottomOffset={bottomOffset}
      keyboardShouldPersistTaps="handled"
      style={outer}
      contentContainerStyle={[container, contentContainerStyle]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
