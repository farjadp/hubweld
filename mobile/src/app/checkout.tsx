import { useState } from "react";
import type { Me } from "@shared/api-types";
import { Pressable, View } from "react-native";
import { FormScroll } from "@/components/FormScroll";
import { router } from "expo-router";
import { Chips } from "@/components/Chips";
import { TotalsBlock } from "@/components/TotalsBlock";
import { Button, Card, Field, Label, Loading, Notice, Text } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useCart, useCheckout, useMe, type CheckoutInput } from "@/lib/queries";
import { PROVINCES } from "@/lib/format";

const COUNTRIES = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "OTHER", label: "Elsewhere" },
];

export default function Checkout() {
  const me = useMe();
  return me.data ? <CheckoutForm me={me.data} /> : <Loading />;
}

function CheckoutForm({ me }: { me: Me }) {
  const checkout = useCheckout();
  const [country, setCountry] = useState("CA");
  const [otherCountry, setOtherCountry] = useState("");
  const [form, setForm] = useState({
    name: me.name,
    company: me.supplierProfile?.businessName ?? "",
    address: "",
    city: me.city ?? "",
    region: "",
    postal: "",
    phone: me.phone ?? "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<CheckoutInput["paymentMethod"]>("contact");
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const sendCountry = country === "OTHER" ? otherCountry.trim() : country;
  // The estimate comes from the server's own tax table for this destination.
  const cart = useCart({ country: sendCountry || "OTHER", region: form.region });
  const items = cart.data?.items ?? [];

  function submit() {
    if (form.name.trim().length < 2) return setError("Enter the name for delivery.");
    if (form.address.trim().length < 3) return setError("Enter the street address.");
    if (!form.city.trim()) return setError("Enter the city.");
    if (country === "CA" && !form.region) return setError("Choose the province — it sets the sales tax.");
    if (country === "OTHER" && !otherCountry.trim()) return setError("Enter the country.");
    if (!form.phone.trim()) return setError("Add a phone number so we can confirm the order.");
    setError(null);
    checkout.mutate(
      { ...form, country: sendCountry, paymentMethod, name: form.name.trim(), address: form.address.trim(), city: form.city.trim() },
      {
        onSuccess: ({ id }) => router.replace({ pathname: "/order/[id]", params: { id, placed: "1" } }),
        onError: (e) => setError(errorMessage(e)),
      }
    );
  }

  if (cart.isPending) return <Loading />;
  if (!items.length && !checkout.isPending) {
    return (
      <View className="p-5">
        <Notice>Your cart is empty.</Notice>
      </View>
    );
  }

  return (
    <FormScroll contentContainerClassName="gap-5 py-5 pb-16">
        <View className="px-5">
          <Notice title="No payment is taken in the app">
            Your order is recorded and the stock reserved. Our team contacts you to confirm it and arrange payment — nothing is charged now.
          </Notice>
        </View>

        <View className="gap-4 px-5">
          <Label accent>Deliver to</Label>
          <Field label="Name" value={form.name} onChangeText={set("name")} autoComplete="name" textContentType="name" />
          <Field label="Company (optional)" value={form.company} onChangeText={set("company")} textContentType="organizationName" />
          <Field label="Street address" value={form.address} onChangeText={set("address")} autoComplete="street-address" textContentType="fullStreetAddress" />
          <Field label="City" value={form.city} onChangeText={set("city")} textContentType="addressCity" />
        </View>

        <View className="gap-1.5">
          <Label className="px-5">Country</Label>
          <Chips value={country} onChange={(v) => { setCountry(v); set("region")(""); }} options={COUNTRIES} allLabel={null} />
        </View>
        {country === "OTHER" ? (
          <View className="px-5"><Field label="Country" value={otherCountry} onChangeText={setOtherCountry} textContentType="countryName" /></View>
        ) : null}
        {country === "CA" ? (
          <View className="gap-1.5">
            <Label className="px-5">Province</Label>
            <Chips value={form.region} onChange={set("region")} options={PROVINCES.map((p) => ({ value: p.code, label: p.code }))} allLabel={null} />
          </View>
        ) : (
          <View className="px-5"><Field label="State / region" value={form.region} onChangeText={set("region")} textContentType="addressState" /></View>
        )}

        <View className="gap-4 px-5">
          <Field label="Postal / ZIP code" value={form.postal} onChangeText={set("postal")} autoCapitalize="characters" textContentType="postalCode" />
          <Field label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" textContentType="telephoneNumber" />
          <Field label="Notes (optional)" value={form.notes} onChangeText={set("notes")} multiline placeholder="Dock hours, PO number, anything we should know" />
        </View>

        <View className="gap-2 px-5">
          <Label accent>How would you like to pay?</Label>
          {([
            { value: "contact", title: "Contact me to arrange payment", body: "We call you to confirm the order and take payment." },
            { value: "net30", title: "Net 30 invoice", body: "For approved business accounts. We confirm your terms first." },
          ] as const).map((o) => {
            const on = paymentMethod === o.value;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setPaymentMethod(o.value)}
                className={`flex-row gap-3 rounded-sm border p-3.5 ${on ? "border-brand bg-brand/5" : "border-slate-300 bg-panel"}`}
              >
                <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${on ? "border-brand" : "border-slate-400"}`}>
                  {on ? <View className="h-2.5 w-2.5 rounded-full bg-brand" /> : null}
                </View>
                <View className="flex-1">
                  <Text className="font-body-semibold text-slate-900">{o.title}</Text>
                  <Text className="text-[13px] text-slate-500">{o.body}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="px-5">
          <Card className="gap-4 p-4">
            <Label>{items.length} {items.length === 1 ? "line" : "lines"}</Label>
            {cart.data?.totals ? (
              <TotalsBlock totals={cart.data.totals} taxNote={country === "CA" ? "Choose province" : undefined} />
            ) : null}
            <Text className="text-[12px] text-slate-500">Tax is an estimate from the delivery province and is confirmed with you before payment.</Text>
            {error ? <Notice tone="error">{error}</Notice> : null}
            <Button title="Place order" loading={checkout.isPending} onPress={submit} />
          </Card>
        </View>
      </FormScroll>
  );
}
