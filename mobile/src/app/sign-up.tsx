import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { HardHat, Store, Wrench, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Field, Heading, Label, Notice, Seam, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";

type Role = "CUSTOMER" | "WELDER" | "SUPPLIER";

const ROLES: { value: Role; title: string; body: string; Icon: typeof Wrench }[] = [
  { value: "CUSTOMER", title: "I need welding work", body: "Post jobs, compare bids, buy supplies.", Icon: HardHat },
  { value: "WELDER", title: "I'm a welder", body: "Find jobs, bid, build your profile.", Icon: Wrench },
  { value: "SUPPLIER", title: "I sell equipment", body: "List products and fulfil orders.", Icon: Store },
];

export default function SignUp() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", businessName: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (form.name.trim().length < 2) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
    setBusy(true);
    setError(null);
    try {
      await register({
        role,
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        city: form.city.trim() || undefined,
        businessName: role === "SUPPLIER" ? form.businessName.trim() || undefined : undefined,
      });
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-ground">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-12" contentContainerStyle={{ paddingTop: Platform.OS === "android" ? insets.top + 12 : 20 }}>
        <View className="mb-6 flex-row justify-end">
          <Pressable accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()}>
            <X size={24} color={colors.slate700} />
          </Pressable>
        </View>
        <Label accent>Join HubWeld</Label>
        <Heading className="mt-2 text-[34px] leading-[36px]">Create account</Heading>

        <View className="mt-6 gap-2">
          {ROLES.map(({ value, title, body, Icon }) => {
            const on = role === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setRole(value)}
                className={`flex-row items-center gap-3 rounded-sm border p-3.5 ${on ? "border-brand bg-brand/5" : "border-slate-300 bg-panel"}`}
              >
                <Icon size={22} color={on ? colors.brand : colors.slate500} />
                <View className="flex-1">
                  <Text className="font-body-semibold text-slate-900">{title}</Text>
                  <Text className="text-[13px] text-slate-500">{body}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Seam className="my-6" />

        <View className="gap-4">
          <Field label={role === "SUPPLIER" ? "Your name" : "Full name"} value={form.name} onChangeText={set("name")} autoComplete="name" textContentType="name" />
          {role === "SUPPLIER" ? <Field label="Business name" value={form.businessName} onChangeText={set("businessName")} textContentType="organizationName" /> : null}
          <Field label="Email" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
          <Field label="Password" value={form.password} onChangeText={set("password")} secureTextEntry autoComplete="new-password" textContentType="newPassword" hint="At least 8 characters." />
          <Field label="City" value={form.city} onChangeText={set("city")} textContentType="addressCity" hint={role === "WELDER" ? "Where you mostly work." : undefined} />
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button title="Create account" loading={busy} onPress={submit} className="mt-2" />
        </View>

        <View className="mt-8 items-center gap-1">
          <Text className="text-slate-600">Already have an account?</Text>
          <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
            <Text className="font-body-semibold text-brand">Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
