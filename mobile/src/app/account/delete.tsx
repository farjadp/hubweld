import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, Field, Heading, Notice, Text } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/** In-app account deletion (required by both app stores). See DELETE /api/account. */
export default function DeleteAccount() {
  const { forget } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!password) return setError("Enter your password to confirm.");
    setBusy(true);
    setError(null);
    try {
      await api("/api/account", { method: "DELETE", body: { password } });
      await forget();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90} className="flex-1 bg-ground">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 px-5 pb-16 pt-4">
        <Heading className="text-[26px]">Delete your account</Heading>
        <View className="gap-2">
          <Text className="leading-6 text-slate-700">This permanently removes:</Text>
          <Text className="text-slate-700">• your name, email, phone and city</Text>
          <Text className="text-slate-700">• your welder profile, photos and résumé, or your storefront details</Text>
          <Text className="text-slate-700">• your cart, and you are signed out everywhere</Text>
          <Text className="mt-2 leading-6 text-slate-700">Your open jobs are closed, pending bids withdrawn and any products taken off sale. Records of past orders are kept, as tax law requires, but no longer carry your name.</Text>
        </View>
        <Notice tone="error">This can’t be undone.</Notice>
        <Field label="Your password" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <Button title="Permanently delete" loading={busy} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
