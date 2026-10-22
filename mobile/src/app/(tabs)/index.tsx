import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Badge, Button, Card, Heading, Label, Notice, Seam, Text, colors } from "@/components/ui";
import { TabHeader } from "@/components/TabHeader";
import { ProductCard } from "@/components/ProductCard";
import { JobCard } from "@/components/JobCard";
import { useAuth } from "@/lib/auth";
import { useFeatured, useJobs, useMe, useMyBids, useMyJobs, useOrders, useSupplierLines, useSupplierProducts } from "@/lib/queries";
import { useRefetchOnFocus } from "@/lib/focus";
import { BID_STATUS, JOB_STATUS, ORDER_STATUS, formatCents, formatDollars } from "@/lib/format";

export default function Home() {
  const { user } = useAuth();
  const first = user?.name.split(" ")[0];
  return (
    <View className="flex-1 bg-ground">
      <TabHeader kicker={user ? `Welcome, ${first}` : "Welding, sorted"} title={user ? "Dashboard" : "HubWeld"} />
      {user?.role === "WELDER" ? <WelderHome /> : user?.role === "SUPPLIER" ? <SupplierHome /> : user ? <CustomerHome /> : <GuestHome />}
    </View>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <Card className="flex-1 p-3">
      <Text className="font-display text-[28px] leading-[30px] text-slate-900">{value}</Text>
      <Text className="text-[12px] text-slate-500">{label}</Text>
    </Card>
  );
}

function SectionTitle({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <View className="mb-3 mt-7 flex-row items-center justify-between">
      <Label accent>{title}</Label>
      {onMore ? (
        <Text onPress={onMore} className="font-body-semibold text-[13px] text-brand">See all</Text>
      ) : null}
    </View>
  );
}

function Row({ title, sub, right, onPress }: { title: string; sub?: string; right?: React.ReactNode; onPress: () => void }) {
  return (
    <Card onPress={onPress} className="flex-row items-center gap-3 p-4">
      <View className="flex-1">
        <Text numberOfLines={1} className="font-body-semibold text-slate-900">{title}</Text>
        {sub ? <Text numberOfLines={1} className="text-[13px] text-slate-500">{sub}</Text> : null}
      </View>
      {right}
      <ChevronRight size={18} color={colors.slate400} />
    </Card>
  );
}

function Scroll({ children, refreshing, onRefresh }: { children: React.ReactNode; refreshing: boolean; onRefresh: () => void }) {
  return (
    <ScrollView
      contentContainerClassName="px-5 pb-12 pt-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
    >
      {children}
    </ScrollView>
  );
}

function GuestHome() {
  const featured = useFeatured();
  const jobs = useJobs("", "");
  useRefetchOnFocus(featured.refetch, jobs.refetch);
  const openJobs = jobs.data?.pages[0]?.items.slice(0, 3) ?? [];
  return (
    <Scroll refreshing={featured.isRefetching} onRefresh={() => { void featured.refetch(); void jobs.refetch(); }}>
      <Card className="overflow-hidden">
        <View className="h-1 bg-brand" />
        <View className="gap-3 p-5">
          <Heading className="text-[26px] leading-[28px]">Certified welders. Industrial supplies. One account.</Heading>
          <Text className="text-slate-600">Post a job and compare bids, find work near you, or order equipment from verified suppliers.</Text>
          <View className="mt-1 flex-row gap-2">
            <Button title="Get started" onPress={() => router.push("/sign-up")} className="flex-1" />
            <Button title="Sign in" variant="secondary" onPress={() => router.push("/sign-in")} className="flex-1" />
          </View>
        </View>
      </Card>

      {featured.data?.items.length ? (
        <>
          <SectionTitle title="Featured supplies" onMore={() => router.push("/(tabs)/shop")} />
          <View className="flex-row flex-wrap gap-3">
            {featured.data.items.slice(0, 4).map((p) => (
              <ProductCard key={p.id} p={p} className="w-[48%]" />
            ))}
          </View>
        </>
      ) : null}

      {openJobs.length ? (
        <>
          <SectionTitle title="Open jobs" onMore={() => router.push("/(tabs)/jobs")} />
          <View className="gap-3">{openJobs.map((j) => <JobCard key={j.id} job={j} />)}</View>
        </>
      ) : null}

      <SectionTitle title="Need a welder?" />
      <Row title="Browse the welder directory" sub="Verified welders by skill and city" onPress={() => router.push("/welders")} />
    </Scroll>
  );
}

function CustomerHome() {
  const jobs = useMyJobs();
  const orders = useOrders();
  useRefetchOnFocus(jobs.refetch, orders.refetch);
  const list = jobs.data ?? [];
  const active = list.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED");
  return (
    <Scroll refreshing={jobs.isRefetching} onRefresh={() => { void jobs.refetch(); void orders.refetch(); }}>
      <View className="flex-row gap-3">
        <Stat value={active.length} label="Active jobs" />
        <Stat value={list.reduce((a, j) => a + j.bidCount, 0)} label="Bids received" />
        <Stat value={list.filter((j) => j.status === "COMPLETED").length} label="Completed" />
      </View>
      <Button title="Post a job" onPress={() => router.push("/job/new")} className="mt-4" />

      <SectionTitle title="Active jobs" onMore={() => router.push("/(tabs)/jobs")} />
      {active.length === 0 ? (
        <Text className="text-slate-500">No active jobs. Post one and welders will start bidding.</Text>
      ) : (
        <View className="gap-3">{active.slice(0, 3).map((j) => <JobCard key={j.id} job={j} showStatus />)}</View>
      )}

      <SectionTitle title="Recent orders" onMore={() => router.push("/orders")} />
      {(orders.data ?? []).length === 0 ? (
        <Text className="text-slate-500">No orders yet.</Text>
      ) : (
        <View className="gap-2">
          {orders.data!.slice(0, 3).map((o) => (
            <Row
              key={o.id}
              title={`Order ${o.reference}`}
              sub={`${o.itemCount} ${o.itemCount === 1 ? "item" : "items"} · ${formatCents(o.totalCents)}`}
              right={<Badge {...ORDER_STATUS[o.status]} />}
              onPress={() => router.push({ pathname: "/order/[id]", params: { id: o.id } })}
            />
          ))}
        </View>
      )}

      <SectionTitle title="Find a welder" />
      <Row title="Browse the welder directory" sub="Verified welders by skill and city" onPress={() => router.push("/welders")} />
    </Scroll>
  );
}

function WelderHome() {
  const me = useMe();
  const bids = useMyBids();
  useRefetchOnFocus(bids.refetch, me.refetch);
  const list = bids.data ?? [];
  const active = list.filter((b) => b.status === "ACCEPTED" && (b.job.status === "ASSIGNED" || b.job.status === "IN_PROGRESS"));
  const pending = list.filter((b) => b.status === "PENDING");
  const done = list.filter((b) => b.status === "ACCEPTED" && b.job.status === "COMPLETED");
  const profile = me.data?.welderProfile;
  const incomplete = !profile || !profile.bio || profile.skills.length === 0;

  return (
    <Scroll refreshing={bids.isRefetching} onRefresh={() => { void bids.refetch(); void me.refetch(); }}>
      {incomplete ? (
        <View className="mb-4">
          <Notice title="Finish your profile">Customers pick welders with a photo, skills and past work. Complete yours to win more bids.</Notice>
          <Button title="Edit profile" variant="secondary" size="sm" onPress={() => router.push("/account/welder-profile")} className="mt-2 self-start" />
        </View>
      ) : !profile?.approved ? (
        <View className="mb-4">
          <Notice>Your profile is waiting for verification. You can bid in the meantime.</Notice>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Stat value={active.length} label="Active jobs" />
        <Stat value={pending.length} label="Pending bids" />
        <Stat value={done.length} label="Completed" />
      </View>
      <Button title="Find work" onPress={() => router.push("/(tabs)/jobs")} className="mt-4" />

      {active.length > 0 ? (
        <>
          <SectionTitle title="Active jobs" />
          <View className="gap-2">
            {active.map((b) => (
              <Row
                key={b.id}
                title={b.job.title}
                sub={`${b.job.city} · ${formatDollars(b.amount)}`}
                right={<Badge {...JOB_STATUS[b.job.status]} />}
                onPress={() => router.push({ pathname: "/job/[id]", params: { id: b.job.id } })}
              />
            ))}
          </View>
        </>
      ) : null}

      <SectionTitle title="My bids" />
      {list.length === 0 ? (
        <Text className="text-slate-500">No bids yet. Open jobs are under Find work.</Text>
      ) : (
        <View className="gap-2">
          {list
            .filter((b) => !active.includes(b))
            .slice(0, 8)
            .map((b) => (
              <Row
                key={b.id}
                title={b.job.title}
                sub={`${b.job.city} · ${formatDollars(b.amount)}`}
                right={<Badge {...BID_STATUS[b.status]} />}
                onPress={() => router.push({ pathname: "/job/[id]", params: { id: b.job.id } })}
              />
            ))}
        </View>
      )}
    </Scroll>
  );
}

function SupplierHome() {
  const me = useMe();
  const lines = useSupplierLines();
  const products = useSupplierProducts();
  useRefetchOnFocus(lines.refetch, products.refetch);
  const toShip = (lines.data ?? []).filter((l) => l.status === "PENDING" && l.orderStatus !== "CANCELLED");
  const live = (products.data ?? []).filter((p) => p.status === "ACTIVE");
  const lowStock = live.filter((p) => p.stock <= 3);

  return (
    <Scroll refreshing={lines.isRefetching} onRefresh={() => { void lines.refetch(); void products.refetch(); }}>
      {me.data?.supplierProfile && !me.data.supplierProfile.approved ? (
        <View className="mb-4">
          <Notice>Your storefront is waiting for verification. Your products are listed in the meantime.</Notice>
        </View>
      ) : null}
      <View className="flex-row gap-3">
        <Stat value={toShip.length} label="Lines to ship" />
        <Stat value={live.length} label="Live products" />
        <Stat value={lowStock.length} label="Low stock" />
      </View>

      <SectionTitle title="To ship" onMore={() => router.push("/(tabs)/sales")} />
      {toShip.length === 0 ? (
        <Text className="text-slate-500">Nothing waiting. New orders show up here and as notifications.</Text>
      ) : (
        <View className="gap-2">
          {toShip.slice(0, 5).map((l) => (
            <Row key={l.id} title={l.name} sub={`${l.reference} · Qty ${l.quantity} · ${l.shipTo}`} onPress={() => router.push("/(tabs)/sales")} />
          ))}
        </View>
      )}

      {lowStock.length > 0 ? (
        <>
          <SectionTitle title="Low stock" />
          <View className="gap-2">
            {lowStock.slice(0, 5).map((p) => (
              <Row key={p.id} title={p.name} sub={`${p.stock} left`} onPress={() => router.push({ pathname: "/supplier/product", params: { id: p.id } })} />
            ))}
          </View>
        </>
      ) : null}
      <Seam className="mt-8" />
    </Scroll>
  );
}
