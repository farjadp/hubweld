import { useRef, useState, type ComponentRef } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import { FormScroll } from "@/components/FormScroll";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Field, Heading, Label, Notice, Seam, Text, colors } from "@/components/ui";
import { LogoMark } from "@/components/TabHeader";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";

export default function SignIn() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  async function submit() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      // The protected route group closes this modal on its own once signed in.
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <FormScroll contentContainerClassName="px-6 pb-10" contentContainerStyle={{ paddingTop: Platform.OS === "android" ? insets.top + 12 : 20 }}>
        <View className="mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <LogoMark size={28} />
            <Text className="font-display text-[18px] uppercase tracking-machine text-slate-900">HubWeld</Text>
          </View>
          <Pressable accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()}>
            <X size={24} color={colors.slate700} />
          </Pressable>
        </View>

        <Label accent>Welcome back</Label>
        <Heading className="mt-2 text-[34px] leading-[36px]">Sign in</Heading>
        <Text className="mt-2 text-slate-600">Bid on jobs, order supplies and message your crew — same account as hubweld.ca.</Text>

        <Seam className="my-6" />

        <View className="gap-4">
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Field
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button title="Sign in" loading={busy} onPress={submit} className="mt-2" />
        </View>

        <View className="mt-8 items-center gap-1">
          <Text className="text-slate-600">New to HubWeld?</Text>
          <Pressable onPress={() => router.replace("/sign-up")} hitSlop={8}>
            <Text className="font-body-semibold text-brand">Create an account</Text>
          </Pressable>
        </View>
      </FormScroll>
  );
}
