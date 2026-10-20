import { View } from "react-native";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import type { JobSummary } from "@shared/api-types";
import { Badge, Card, Text, colors } from "@/components/ui";
import { JOB_STATUS, categoryLabel, formatDollars, timeAgo } from "@/lib/format";

export function JobCard({ job, showStatus = false }: { job: JobSummary; showStatus?: boolean }) {
  const st = JOB_STATUS[job.status];
  return (
    <Card className="gap-2 p-4" onPress={() => router.push({ pathname: "/job/[id]", params: { id: job.id } })}>
      <View className="flex-row items-start justify-between gap-3">
        <Text numberOfLines={2} className="flex-1 font-body-semibold text-[16px] leading-5 text-slate-900">{job.title}</Text>
        {job.budget ? <Text className="font-body-bold text-[15px] text-brand">{formatDollars(job.budget)}</Text> : null}
      </View>
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <View className="flex-row items-center gap-1">
          <MapPin size={13} color={colors.slate500} />
          <Text className="text-[13px] text-slate-500">{job.city}</Text>
        </View>
        <Text className="text-[13px] text-slate-500">{categoryLabel(job.category)}</Text>
        <Text className="text-[13px] text-slate-500">{job.bidCount} {job.bidCount === 1 ? "bid" : "bids"}</Text>
        <Text className="text-[13px] text-slate-400">{timeAgo(job.createdAt)}</Text>
      </View>
      {showStatus ? <Badge label={st.label} tone={st.tone} /> : null}
    </Card>
  );
}
