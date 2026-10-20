import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/Text";
import { colors } from "@/components/ui/colors";
import { errorMessage } from "@/lib/api";

export function Loading({ label }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-16">
      <ActivityIndicator color={colors.brand} />
      {label ? <Text className="text-slate-500">{label}</Text> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 py-16">
      <Heading className="text-xl">Couldn’t load this</Heading>
      <Text className="text-center text-slate-600">{errorMessage(error)}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <View className="items-center gap-3 px-8 py-14">
      <Heading className="text-center text-xl">{title}</Heading>
      {body ? <Text className="text-center text-slate-600">{body}</Text> : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  );
}
