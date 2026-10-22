import { useState } from "react";
import type { CategoryDto, ProductDetail } from "@shared/api-types";
import { Pressable, View } from "react-native";
import { FormScroll } from "@/components/FormScroll";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Chips } from "@/components/Chips";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button, ErrorState, Field, Label, Loading, Notice, Text } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useCategories, useProduct, useSaveProduct, type ProductInput } from "@/lib/queries";
import { slugify } from "@/lib/format";

/** Create (no id) or edit (?id=) a product. Photos come straight from the camera. */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useProduct(id ?? "");
  const categories = useCategories();
  if ((id && !existing.data) || !categories.data) {
    if (existing.isError) return <ErrorState error={existing.error} onRetry={() => void existing.refetch()} />;
    if (categories.isError) return <ErrorState error={categories.error} onRetry={() => void categories.refetch()} />;
    return <Loading />;
  }
  return <ProductForm product={id ? existing.data! : null} categories={categories.data} />;
}

function ProductForm({ product: p, categories: top }: { product: ProductDetail | null; categories: CategoryDto[] }) {
  const editing = !!p;
  const save = useSaveProduct(p?.id);
  const [form, setForm] = useState({
    name: p?.name ?? "",
    brand: p?.brand ?? "",
    sku: p?.sku ?? "",
    price: p ? (p.priceCents / 100).toFixed(2) : "",
    stock: p ? String(p.stock) : "",
    description: p?.description ?? "",
  });
  const [categoryId, setCategoryId] = useState(p?.category.id ?? "");
  // The top-level category the chosen one belongs to, so both chip rows show it.
  const [parent, setParent] = useState(
    () => top.find((c) => c.id === p?.category.id || c.children.some((k) => k.id === p?.category.id))?.id ?? ""
  );
  const [status, setStatus] = useState<ProductInput["status"]>(p?.status ?? "ACTIVE");
  const [photos, setPhotos] = useState<string[]>(p?.imageUrl ? [p.imageUrl] : []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const children = top.find((c) => c.id === parent)?.children ?? [];

  function submit() {
    const priceCents = Math.round(Number.parseFloat(form.price.replace(/[^0-9.]/g, "")) * 100);
    const stock = Number.parseInt(form.stock.replace(/[^0-9]/g, ""), 10);
    if (form.name.trim().length < 3) return setError("Name the product.");
    if (!categoryId) return setError("Choose a category.");
    if (!Number.isFinite(priceCents) || priceCents < 0) return setError("Enter a price in CAD, e.g. 129.99");
    if (!Number.isFinite(stock) || stock < 0) return setError("Enter how many you have in stock.");
    setError(null);
    const body: ProductInput = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      sku: form.sku.trim(),
      // A new product gets a unique slug; an edit keeps its URL stable.
      slug: p ? p.slug : `${slugify(form.name)}-${Date.now().toString(36)}`,
      categoryId,
      priceCents,
      stock,
      imageUrl: photos[0] ?? "",
      description: form.description.trim(),
      status,
    };
    save.mutate(body, {
      onSuccess: () => router.back(),
      onError: (e) => setError(errorMessage(e)),
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: editing ? "Edit product" : "New product" }} />
      <FormScroll contentContainerClassName="gap-5 py-5 pb-16">
        <View className="gap-5 px-5">
          <PhotoPicker label="Photo" kind="product" value={photos} onChange={setPhotos} max={1} onBusyChange={setUploading} />
          <Field label="Name" value={form.name} onChangeText={set("name")} maxLength={160} />
          <View className="flex-row gap-3">
            <Field className="flex-1" label="Brand" value={form.brand} onChangeText={set("brand")} />
            <Field className="flex-1" label="SKU" value={form.sku} onChangeText={set("sku")} autoCapitalize="characters" />
          </View>
          <View className="flex-row gap-3">
            <Field className="flex-1" label="Price (CAD)" value={form.price} onChangeText={set("price")} keyboardType="decimal-pad" placeholder="0.00" />
            <Field className="flex-1" label="Stock" value={form.stock} onChangeText={set("stock")} keyboardType="number-pad" />
          </View>
        </View>

        <View className="gap-1.5">
          <Label className="px-5">Category</Label>
          <Chips value={parent} onChange={(v) => { setParent(v); setCategoryId(v); }} options={top.map((c) => ({ value: c.id, label: c.name }))} allLabel={null} />
          {children.length ? (
            <View className="mt-1">
              <Chips value={categoryId === parent ? "" : categoryId} onChange={(v) => setCategoryId(v || parent)} options={children.map((c) => ({ value: c.id, label: c.name }))} allLabel="General" />
            </View>
          ) : null}
        </View>

        <View className="gap-5 px-5">
          <Field label="Description" value={form.description} onChangeText={set("description")} multiline placeholder="Specs, what's in the box, compatible consumables…" />
          <View className="gap-1.5">
            <Label>Visibility</Label>
            <View className="flex-row gap-2">
              {(["ACTIVE", "DRAFT", "ARCHIVED"] as const).map((s) => (
                <Pressable key={s} onPress={() => setStatus(s)} accessibilityRole="radio" accessibilityState={{ checked: status === s }} className={`flex-1 items-center rounded-sm border py-2 ${status === s ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-panel"}`}>
                  <Text className={`font-body-medium text-[13px] ${status === s ? "text-white" : "text-slate-700"}`}>{s === "ACTIVE" ? "Listed" : s === "DRAFT" ? "Draft" : "Archived"}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button title={uploading ? "Uploading photo…" : editing ? "Save changes" : "List product"} loading={save.isPending} disabled={uploading} onPress={submit} />
        </View>
      </FormScroll>
    </>
  );
}
