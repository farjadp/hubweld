import { useState } from "react";
import { View } from "react-native";
import { FormScroll } from "@/components/FormScroll";
import { router } from "expo-router";
import { Chips } from "@/components/Chips";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button, Field, Label, Notice } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePostJob } from "@/lib/queries";
import { JOB_CATEGORIES } from "@/lib/format";

export default function NewJob() {
  const { user } = useAuth();
  const post = usePostJob();
  const [form, setForm] = useState({ title: "", description: "", city: "", category: "repair", budget: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (user && user.role !== "CUSTOMER" && user.role !== "ADMIN") {
    return (
      <View className="p-5">
        <Notice>Only customer accounts post jobs. Welders bid on them; suppliers sell equipment.</Notice>
      </View>
    );
  }

  function submit() {
    if (form.title.trim().length < 3) return setError("Give the job a short title.");
    if (form.description.trim().length < 10) return setError("Describe the work in a sentence or two.");
    if (form.city.trim().length < 2) return setError("Where is the job?");
    const budget = form.budget ? Number.parseInt(form.budget.replace(/[^0-9]/g, ""), 10) : null;
    if (form.budget && (!Number.isFinite(budget) || (budget ?? 0) <= 0)) return setError("Budget is whole dollars, or leave it empty.");
    setError(null);
    post.mutate(
      { title: form.title.trim(), description: form.description.trim(), city: form.city.trim(), category: form.category, budget, photos },
      {
        onSuccess: ({ id }) => {
          router.back();
          router.push({ pathname: "/job/[id]", params: { id } });
        },
        onError: (e) => setError(errorMessage(e)),
      }
    );
  }

  return (
    <FormScroll contentContainerClassName="gap-5 py-5 pb-16">
        <View className="gap-5 px-5">
          <Field label="Title" value={form.title} onChangeText={set("title")} placeholder="e.g. Repair cracked trailer hitch" maxLength={120} />
          <Field label="Description" value={form.description} onChangeText={set("description")} multiline placeholder="Material, thickness, process if you know it (MIG/TIG/stick), access, deadline…" />
          <Field label="City" value={form.city} onChangeText={set("city")} textContentType="addressCity" />
        </View>
        <View className="gap-1.5">
          <Label className="px-5">Category</Label>
          <Chips value={form.category} onChange={set("category")} options={JOB_CATEGORIES} allLabel={null} />
        </View>
        <View className="gap-5 px-5">
          <Field label="Budget (CAD, optional)" value={form.budget} onChangeText={set("budget")} keyboardType="number-pad" placeholder="Leave empty to get quotes" />
          <PhotoPicker label="Photos of the job site" kind="job" value={photos} onChange={setPhotos} onBusyChange={setUploading} />
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button title={uploading ? "Uploading photos…" : "Post job"} loading={post.isPending} disabled={uploading} onPress={submit} />
        </View>
      </FormScroll>
  );
}
