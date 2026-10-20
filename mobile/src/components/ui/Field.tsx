import { forwardRef, useState, type ComponentRef } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { Label, Text } from "@/components/ui/Text";
import { colors } from "@/components/ui/colors";

type Props = TextInputProps & { label?: string; hint?: string; error?: string | null; className?: string };

/** Label + input + hint/error, the site's .label / .input pair. */
export const Field = forwardRef<ComponentRef<typeof TextInput>, Props>(function Field({ label, hint, error, className = "", multiline, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View className={className}>
      {label ? <Label className="mb-1.5">{label}</Label> : null}
      <TextInput
        ref={ref}
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.slate400}
        selectionColor={colors.brand}
        cursorColor={colors.brand}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-sm border bg-panel px-4 py-3 font-body text-[16px] text-slate-900 ${
          error ? "border-brand" : focused ? "border-brand" : "border-slate-300"
        } ${multiline ? "min-h-[110px]" : ""}`}
      />
      {error ? (
        <Text className="mt-1 text-[13px] text-brand">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-[13px] text-slate-500">{hint}</Text>
      ) : null}
    </View>
  );
});
