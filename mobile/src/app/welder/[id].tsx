import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BadgeCheck, MapPin, User } from "lucide-react-native";
import { RemoteImage } from "@/components/RemoteImage";
import { Stars } from "@/components/Stars";
import { Card, ErrorState, Heading, Label, Loading, Text, colors } from "@/components/ui";
import { useWelder } from "@/lib/queries";
import { formatDate } from "@/lib/format";

function Tags({ items }: { items: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((s) => (
        <View key={s} className="rounded-sm border border-slate-200 bg-panel px-2.5 py-1">
          <Text className="text-[13px] text-slate-700">{s}</Text>
        </View>
      ))}
    </View>
  );
}

export default function WelderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const welder = useWelder(id);
  if (welder.isPending) return <Loading />;
  if (welder.isError) return <ErrorState error={welder.error} onRetry={() => void welder.refetch()} />;
  const w = welder.data;
  const p = w.profile;

  return (
    <ScrollView contentContainerClassName="gap-6 px-5 pb-16 pt-2">
      <View className="flex-row items-center gap-4">
        {w.avatarUrl ? (
          <RemoteImage uri={w.avatarUrl} label={w.name} className="h-20 w-20 rounded-full" />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-recess">
            <User size={32} color={colors.slate400} />
          </View>
        )}
        <View className="flex-1 gap-1">
          <Heading className="text-[26px] leading-[28px]">{w.name}</Heading>
          {w.verified ? (
            <View className="flex-row items-center gap-1">
              <BadgeCheck size={15} color={colors.green} />
              <Text className="text-[13px] text-green-700">Verified welder</Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color={colors.slate500} />
            <Text className="text-[13px] text-slate-500">{[w.serviceArea || w.city, p?.country].filter(Boolean).join(", ") || "—"}</Text>
          </View>
          {w.rating !== null ? (
            <View className="flex-row items-center gap-1.5">
              <Stars value={Math.round(w.rating)} />
              <Text className="text-[13px] text-slate-600">{w.rating.toFixed(1)} ({w.reviewCount})</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="flex-row gap-3">
        <Card className="flex-1 p-3">
          <Label>Experience</Label>
          <Text className="mt-1 font-body-bold text-slate-900">{p?.yearsExp ? `${p.yearsExp} years` : "—"}</Text>
        </Card>
        <Card className="flex-1 p-3">
          <Label>Rate</Label>
          <Text className="mt-1 font-body-bold text-slate-900">{w.hourlyRate ? `$${w.hourlyRate}/hr` : "—"}</Text>
        </Card>
      </View>

      {p?.bio ? <Text className="leading-6 text-slate-700">{p.bio}</Text> : null}
      {w.skills.length ? <View className="gap-2"><Label accent>Skills</Label><Tags items={w.skills} /></View> : null}
      {p?.certifications ? <View className="gap-2"><Label accent>Certifications</Label><Text className="text-slate-700">{p.certifications}</Text></View> : null}
      {p?.languages.length ? <View className="gap-2"><Label accent>Languages</Label><Tags items={p.languages} /></View> : null}
      {p?.serviceCountries.length ? <View className="gap-2"><Label accent>Serves in</Label><Tags items={p.serviceCountries} /></View> : null}

      {p?.gallery.length ? (
        <View className="gap-3">
          <Label accent>Project gallery</Label>
          <View className="flex-row flex-wrap gap-2">
            {p.gallery.map((url) => <RemoteImage key={url} uri={url} label="Project photo" className="aspect-square w-[32%] rounded-sm" />)}
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <Label accent>Reviews</Label>
        {w.reviews.length === 0 ? (
          <Text className="text-slate-500">No reviews yet.</Text>
        ) : (
          w.reviews.map((r) => (
            <Card key={r.id} className="gap-1.5 p-4">
              <Stars value={r.rating} />
              {r.comment ? <Text className="text-slate-700">{r.comment}</Text> : null}
              <Text className="text-[12px] text-slate-500">— {r.authorName}, {formatDate(r.createdAt)}</Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}
