import { useState } from "react";
import type { Me } from "@shared/api-types";
import { View } from "react-native";
import { FormScroll } from "@/components/FormScroll";
import { Button, Field, Label, Loading, Notice, Seam } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useMe, useSaveAccount } from "@/lib/queries";

export default function AccountDetails() {
  const me = useMe();
  return me.data ? <DetailsForm me={me.data} /> : <Loading />;
}

function DetailsForm({ me }: { me: Me }) {
  const save = useSaveAccount();
  const [form, setForm] = useState({
    name: me.name,
    city: me.city ?? "",
    phone: me.phone ?? "",
    businessName: me.supplierProfile?.businessName ?? "",
    description: me.supplierProfile?.description ?? "",
    website: me.supplierProfile?.website ?? "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const supplier = me.role === "SUPPLIER";

  function submit() {
    setMsg(null);
    if (pw.next && pw.next !== pw.confirm) return setMsg({ tone: "error", text: "The two new passwords don't match." });
    if (pw.next && pw.next.length < 8) return setMsg({ tone: "error", text: "New password must be at least 8 characters." });
    save.mutate(
      {
        name: form.name.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        ...(supplier ? { businessName: form.businessName.trim(), description: form.description.trim(), website: form.website.trim() } : {}),
        ...(pw.next ? { currentPassword: pw.current, newPassword: pw.next } : {}),
      },
      {
        onSuccess: () => {
          setMsg({ tone: "ok", text: pw.next ? "Saved. Your password has been changed." : "Saved." });
          setPw({ current: "", next: "", confirm: "" });
        },
        onError: (e) => setMsg({ tone: "error", text: errorMessage(e) }),
      }
    );
  }

  return (
    <FormScroll contentContainerClassName="gap-4 px-5 pb-16 pt-4">
        <Field label="Email" value={me.email} editable={false} hint="Contact HubWeld to change the email on your account." />
        <Field label="Full name" value={form.name} onChangeText={set("name")} textContentType="name" />
        <Field label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" textContentType="telephoneNumber" />
        <Field label="City" value={form.city} onChangeText={set("city")} textContentType="addressCity" />

        {supplier ? (
          <>
            <Seam className="my-2" />
            <Label accent>Storefront</Label>
            <Field label="Business name" value={form.businessName} onChangeText={set("businessName")} />
            <Field label="Description" value={form.description} onChangeText={set("description")} multiline placeholder="What you supply, which brands, who you serve." />
            <Field label="Website" value={form.website} onChangeText={set("website")} autoCapitalize="none" keyboardType="url" placeholder="https://" />
          </>
        ) : null}

        <Seam className="my-2" />
        <Label accent>Change password</Label>
        <Field label="Current password" value={pw.current} onChangeText={(v) => setPw((p) => ({ ...p, current: v }))} secureTextEntry textContentType="password" />
        <Field label="New password" value={pw.next} onChangeText={(v) => setPw((p) => ({ ...p, next: v }))} secureTextEntry textContentType="newPassword" />
        <Field label="Confirm new password" value={pw.confirm} onChangeText={(v) => setPw((p) => ({ ...p, confirm: v }))} secureTextEntry textContentType="newPassword" />

        {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
        <View className="mt-2">
          <Button title="Save changes" loading={save.isPending} onPress={submit} />
        </View>
      </FormScroll>
  );
}
