import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { colors } from "@/components/ui";

/** Search field that reports its value after the user pauses typing. */
export function SearchBar({ placeholder, onSearch }: { placeholder: string; onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(t);
  }, [value, onSearch]);
  return (
    <View className="mx-5 flex-row items-center gap-2 rounded-sm border border-slate-300 bg-panel px-3">
      <Search size={18} color={colors.slate400} />
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.slate400}
        selectionColor={colors.brand}
        returnKeyType="search"
        autoCorrect={false}
        className="flex-1 py-3 font-body text-[16px] text-slate-900"
      />
      {value ? (
        <Pressable accessibilityLabel="Clear search" hitSlop={10} onPress={() => setValue("")}>
          <X size={18} color={colors.slate500} />
        </Pressable>
      ) : null}
    </View>
  );
}
