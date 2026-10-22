import { useState } from "react";
import type { WelderProfileDto } from "@shared/api-types";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Camera, User } from "lucide-react-native";
import { PhotoPicker } from "@/components/PhotoPicker";
import { RemoteImage } from "@/components/RemoteImage";
import { Button, Field, Label, Loading, Notice, Seam, Text, colors } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useMe, useSaveWelderProfile } from "@/lib/queries";
import { chooseSource, pickImages, uploadImage } from "@/lib/upload";

const SKILLS = ["MIG", "TIG", "Stick", "Flux-core", "Pipe", "Structural", "Stainless", "Aluminum", "Mobile", "Fabrication"];

export default function WelderProfile() {
  const me = useMe();
  if (!me.data) return <Loading />;
  return <ProfileForm profile={me.data.welderProfile} />;
}

function ProfileForm({ profile: p }: { profile: WelderProfileDto | null }) {
  const save = useSaveWelderProfile();
  const [form, setForm] = useState({
    bio: p?.bio ?? "",
    certifications: p?.certifications ?? "",
    serviceArea: p?.serviceArea ?? "",
    hourlyRate: p?.hourlyRate ? String(p.hourlyRate) : "",
    yearsExp: p?.yearsExp ? String(p.yearsExp) : "",
    languages: p?.languages.join(", ") ?? "",
    country: p?.country ?? "",
    serviceCountries: p?.serviceCountries.join(", ") ?? "",
  });
  const [skills, setSkills] = useState<string[]>(p?.skills ?? []);
  const [avatar, setAvatar] = useState(p?.avatarUrl ?? "");
  const [gallery, setGallery] = useState<string[]>(p?.gallery ?? []);
  // Kept as-is: résumés are uploaded on the website.
  const resumeUrl = p?.resumeUrl ?? "";
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function changeAvatar() {
    const source = await chooseSource();
    if (!source) return;
    const [asset] = await pickImages(source, { square: true });
    if (!asset) return;
    setBusy(true);
    try {
      setAvatar(await uploadImage(asset, "avatar"));
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  const toggle = (s: string) => setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const num = (v: string) => (v.trim() ? Number.parseInt(v.replace(/[^0-9]/g, ""), 10) : null);

  function submit() {
    setMsg(null);
    const years = num(form.yearsExp);
    if (years !== null && (years < 1 || years > 40)) return setMsg({ tone: "error", text: "Years of experience is between 1 and 40." });
    save.mutate(
      {
        bio: form.bio.trim(),
        skills: skills.join(","),
        certifications: form.certifications.trim(),
        serviceArea: form.serviceArea.trim(),
        hourlyRate: num(form.hourlyRate),
        yearsExp: years,
        avatarUrl: avatar,
        resumeUrl,
        galleryJson: JSON.stringify(gallery),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean).join(","),
        country: form.country.trim(),
        serviceCountries: form.serviceCountries.split(",").map((s) => s.trim()).filter(Boolean).join(","),
      },
      { onSuccess: () => setMsg({ tone: "ok", text: "Profile saved." }), onError: (e) => setMsg({ tone: "error", text: errorMessage(e) }) }
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90} className="flex-1 bg-ground">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 px-5 pb-16 pt-4">
        <Pressable onPress={changeAvatar} accessibilityRole="button" accessibilityLabel="Change profile photo" className="flex-row items-center gap-4">
          {avatar ? (
            <RemoteImage uri={avatar} label="Profile photo" className="h-20 w-20 rounded-full" />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-full bg-recess">
              <User size={32} color={colors.slate400} />
            </View>
          )}
          <View className="flex-row items-center gap-1.5">
            <Camera size={16} color={colors.brand} />
            <Text className="font-body-semibold text-brand">{busy ? "Uploading…" : avatar ? "Change photo" : "Add a photo"}</Text>
          </View>
        </Pressable>

        <Field label="About you" value={form.bio} onChangeText={set("bio")} multiline maxLength={4000} placeholder="What you weld, the kind of jobs you take, what customers can expect." />

        <View className="gap-1.5">
          <Label>Skills</Label>
          <View className="flex-row flex-wrap gap-2">
            {/* Skills typed on the website may not be in the list; show them so they can be removed. */}
            {[...SKILLS, ...skills.filter((x) => !SKILLS.includes(x))].map((s) => {
              const on = skills.includes(s);
              return (
                <Pressable key={s} onPress={() => toggle(s)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} className={`rounded-sm border px-3 py-1.5 ${on ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-panel"}`}>
                  <Text className={`font-body-medium text-[13px] ${on ? "text-white" : "text-slate-700"}`}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Field label="Certifications" value={form.certifications} onChangeText={set("certifications")} placeholder="e.g. CWB W47.1, AWS D1.1" />
        <View className="flex-row gap-3">
          <Field className="flex-1" label="Rate ($/hr)" value={form.hourlyRate} onChangeText={set("hourlyRate")} keyboardType="number-pad" />
          <Field className="flex-1" label="Years experience" value={form.yearsExp} onChangeText={set("yearsExp")} keyboardType="number-pad" />
        </View>
        <Field label="Service area" value={form.serviceArea} onChangeText={set("serviceArea")} placeholder="e.g. Greater Toronto Area" />
        <Field label="Country" value={form.country} onChangeText={set("country")} />
        <Field label="Countries you serve" value={form.serviceCountries} onChangeText={set("serviceCountries")} hint="Separate with commas." />
        <Field label="Languages" value={form.languages} onChangeText={set("languages")} hint="Separate with commas." />

        <Seam className="my-1" />
        <PhotoPicker label="Project gallery" kind="gallery" value={gallery} onChange={setGallery} max={12} onBusyChange={setBusy} />
        <Text className="text-[13px] text-slate-500">Photos of finished welds win jobs. Résumés are uploaded on hubweld.ca.</Text>

        {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
        <Button title="Save profile" loading={save.isPending} disabled={busy} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
