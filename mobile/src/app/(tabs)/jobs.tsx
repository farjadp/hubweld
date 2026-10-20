import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { Chips } from "@/components/Chips";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { TabHeader } from "@/components/TabHeader";
import { Button, Empty, ErrorState, Loading, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useJobs, useMyJobs } from "@/lib/queries";
import { JOB_CATEGORIES } from "@/lib/format";

/** Customers see the jobs they posted; welders and guests browse open jobs. */
export default function Jobs() {
  const { user } = useAuth();
  return user?.role === "CUSTOMER" || user?.role === "ADMIN" ? <MyJobs /> : <OpenJobs welder={user?.role === "WELDER"} />;
}

function MyJobs() {
  const jobs = useMyJobs();
  return (
    <View className="flex-1 bg-ground">
      <TabHeader
        kicker="Your projects"
        title="My jobs"
        right={<Button title="Post" size="sm" icon={<Plus size={16} color="#fff" />} onPress={() => router.push("/job/new")} />}
      />
      {jobs.isPending ? (
        <Loading />
      ) : jobs.isError ? (
        <ErrorState error={jobs.error} onRetry={() => void jobs.refetch()} />
      ) : (
        <FlatList
          data={jobs.data}
          keyExtractor={(j) => j.id}
          contentContainerClassName="gap-3 px-5 pb-12 pt-4"
          renderItem={({ item }) => <JobCard job={item} showStatus />}
          ListEmptyComponent={
            <Empty
              title="No jobs yet"
              body="Describe the work, add a few photos of the site, and certified welders will send you bids."
              action={<Button title="Post a job" onPress={() => router.push("/job/new")} />}
            />
          }
          refreshControl={<RefreshControl refreshing={jobs.isRefetching} onRefresh={() => void jobs.refetch()} tintColor={colors.brand} />}
        />
      )}
    </View>
  );
}

function OpenJobs({ welder }: { welder: boolean }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const jobs = useJobs(q, category);
  const items = jobs.data?.pages.flatMap((p) => p.items) ?? [];
  const total = jobs.data?.pages[0]?.total ?? 0;
  const onSearch = useCallback((v: string) => setQ(v), []);

  return (
    <View className="flex-1 bg-ground">
      <TabHeader kicker={welder ? "Open for bids" : "Welding jobs"} title={welder ? "Find work" : "Jobs"} />
      <View className="gap-3 pb-3 pt-3">
        <SearchBar placeholder="Search jobs" onSearch={onSearch} />
        <Chips value={category} onChange={setCategory} options={JOB_CATEGORIES} />
      </View>
      {jobs.isPending ? (
        <Loading />
      ) : jobs.isError ? (
        <ErrorState error={jobs.error} onRetry={() => void jobs.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(j) => j.id}
          contentContainerClassName="gap-3 px-5 pb-12"
          renderItem={({ item }) => <JobCard job={item} />}
          ListHeaderComponent={<Text className="font-mono text-[11px] uppercase tracking-machine text-slate-500">{total} open</Text>}
          ListEmptyComponent={<Empty title="No open jobs" body="Nothing matches right now. Pull down to refresh." />}
          ListFooterComponent={jobs.isFetchingNextPage ? <ActivityIndicator color={colors.brand} className="py-6" /> : undefined}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (jobs.hasNextPage && !jobs.isFetchingNextPage) void jobs.fetchNextPage();
          }}
          refreshControl={<RefreshControl refreshing={jobs.isRefetching && !jobs.isFetchingNextPage} onRefresh={() => void jobs.refetch()} tintColor={colors.brand} />}
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}
