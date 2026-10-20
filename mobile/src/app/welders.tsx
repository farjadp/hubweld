import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, MapPin, User } from "lucide-react-native";
import { RemoteImage } from "@/components/RemoteImage";
import { SearchBar } from "@/components/SearchBar";
import { Card, Empty, ErrorState, Loading, Text, colors } from "@/components/ui";
import { useWelders } from "@/lib/queries";

export default function Welders() {
  const [q, setQ] = useState("");
  const [verified, setVerified] = useState(false);
  const welders = useWelders(q, verified);
  const items = welders.data?.pages.flatMap((p) => p.items) ?? [];
  const onSearch = useCallback((v: string) => setQ(v), []);

  return (
    <View className="flex-1 bg-ground">
      <View className="gap-3 pb-3 pt-1">
        <SearchBar placeholder="Skill, certification or name" onSearch={onSearch} />
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: verified }}
          onPress={() => setVerified((v) => !v)}
          className={`mx-5 flex-row items-center gap-1.5 self-start rounded-sm border px-3 py-1.5 ${verified ? "border-green-700/40 bg-green-50" : "border-slate-300 bg-panel"}`}
        >
          <BadgeCheck size={14} color={verified ? colors.green : colors.slate500} />
          <Text className={`font-body-medium text-[13px] ${verified ? "text-green-700" : "text-slate-600"}`}>Verified only</Text>
        </Pressable>
      </View>
      {welders.isPending ? (
        <Loading />
      ) : welders.isError ? (
        <ErrorState error={welders.error} onRetry={() => void welders.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(w) => w.id}
          contentContainerClassName="gap-3 px-5 pb-12"
          ListEmptyComponent={<Empty title="No welders found" body="Try another skill or turn off the verified filter." />}
          ListFooterComponent={welders.isFetchingNextPage ? <ActivityIndicator color={colors.brand} className="py-6" /> : undefined}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (welders.hasNextPage && !welders.isFetchingNextPage) void welders.fetchNextPage();
          }}
          keyboardDismissMode="on-drag"
          renderItem={({ item: w }) => (
            <Card className="flex-row gap-3 p-4" onPress={() => router.push({ pathname: "/welder/[id]", params: { id: w.id } })}>
              {w.avatarUrl ? (
                <RemoteImage uri={w.avatarUrl} label={w.name} className="h-12 w-12 rounded-full" />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-full bg-recess">
                  <User size={22} color={colors.slate400} />
                </View>
              )}
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-body-bold text-slate-900">{w.name}</Text>
                  {w.verified ? <BadgeCheck size={15} color={colors.green} /> : null}
                </View>
                {w.skills.length ? <Text numberOfLines={1} className="text-[13px] text-slate-600">{w.skills.slice(0, 4).join(" · ")}</Text> : null}
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color={colors.slate500} />
                    <Text className="text-[12px] text-slate-500">{w.serviceArea || w.city || "—"}</Text>
                  </View>
                  {w.rating !== null ? <Text className="text-[12px] text-amber-700">★ {w.rating.toFixed(1)} ({w.reviewCount})</Text> : null}
                  {w.hourlyRate ? <Text className="text-[12px] text-slate-500">${w.hourlyRate}/hr</Text> : null}
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
