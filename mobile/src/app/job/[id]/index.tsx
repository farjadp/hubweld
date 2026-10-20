import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BadgeCheck, MapPin, MessageSquare } from "lucide-react-native";
import type { BidDto, JobDetail } from "@shared/api-types";
import { RemoteImage } from "@/components/RemoteImage";
import { Stars } from "@/components/Stars";
import { Badge, Button, Card, ErrorState, Field, Heading, Label, Loading, Notice, Seam, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { useJob, useJobMutations } from "@/lib/queries";
import { BID_STATUS, JOB_STATUS, categoryLabel, formatDate, formatDollars, timeAgo } from "@/lib/format";

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = useJob(id);
  if (job.isPending) return <Loading />;
  if (job.isError) return <ErrorState error={job.error} onRetry={() => void job.refetch()} />;
  return <JobView job={job.data} />;
}

function JobView({ job }: { job: JobDetail }) {
  const { user } = useAuth();
  const m = useJobMutations(job.id);
  const v = job.viewer;
  const st = JOB_STATUS[job.status];
  const fail = (title: string) => (e: unknown) => Alert.alert(title, errorMessage(e));

  const transition = (status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED", title: string, body: string) =>
    Alert.alert(title, body, [
      { text: "Not now", style: "cancel" },
      { text: title, style: status === "CANCELLED" ? "destructive" : "default", onPress: () => m.status.mutate(status, { onError: fail("Couldn't update the job") }) },
    ]);

  const accept = (b: BidDto) =>
    Alert.alert(`Hire ${b.welderName}?`, `Accept their bid of ${formatDollars(b.amount)}. The other bidders are told the job went to someone else.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Accept bid", onPress: () => m.accept.mutate(b.id, { onError: fail("Couldn't accept the bid") }) },
    ]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90} className="flex-1">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-16 pt-2" keyboardShouldPersistTaps="handled">
        <View className="gap-2">
          <Badge {...st} />
          <Heading className="text-[28px] leading-[30px]">{job.title}</Heading>
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color={colors.slate500} />
              <Text className="text-slate-600">{job.city}</Text>
            </View>
            <Text className="text-slate-600">{categoryLabel(job.category)}</Text>
            <Text className="text-slate-500">by {job.customer.name} · {timeAgo(job.createdAt)}</Text>
          </View>
          {job.budget ? <Text className="font-body-bold text-[18px] text-brand">Budget {formatDollars(job.budget)}</Text> : null}
        </View>

        <Text className="leading-6 text-slate-700">{job.description}</Text>

        {job.photos.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {job.photos.map((url) => <RemoteImage key={url} uri={url} label="Job site photo" className="h-40 w-52 rounded-sm" />)}
          </ScrollView>
        ) : null}

        {/* ── What the viewer can do ─────────────────────────────── */}
        {!user ? (
          <Card className="gap-3 p-4">
            <Text className="text-slate-700">Sign in as a welder to bid on this job.</Text>
            <Button title="Sign in" onPress={() => router.push("/sign-in")} />
          </Card>
        ) : null}

        {v.canBid ? <BidForm job={job} /> : null}

        {v.myBid ? (
          <Card className="gap-2 p-4">
            <Label>Your bid</Label>
            <View className="flex-row items-center justify-between">
              <Text className="font-display text-[26px] text-slate-900">{formatDollars(v.myBid.amount)}</Text>
              <Badge {...BID_STATUS[v.myBid.status]} />
            </View>
            {v.myBid.message ? <Text className="text-slate-600">{v.myBid.message}</Text> : null}
          </Card>
        ) : null}

        {v.canMessage && !v.isOwner ? (
          <Button title="Message customer" variant="secondary" icon={<MessageSquare size={18} color={colors.slate700} />} onPress={() => router.push({ pathname: "/job/[id]/chat", params: { id: job.id } })} />
        ) : null}

        {(v.isOwner || v.isAssignedWelder) && job.status !== "COMPLETED" && job.status !== "CANCELLED" ? (
          <View className="gap-2">
            {job.status === "ASSIGNED" ? (
              <Button title="Start work" loading={m.status.isPending} onPress={() => transition("IN_PROGRESS", "Start work", "Mark this job as in progress?")} />
            ) : null}
            {job.status === "IN_PROGRESS" && v.isOwner ? (
              <Button title="Mark completed" loading={m.status.isPending} onPress={() => transition("COMPLETED", "Mark completed", "Confirm the work is finished. You can then review the welder.")} />
            ) : null}
            {v.isOwner ? (
              <Button title="Cancel job" variant="ghost" disabled={m.status.isPending} onPress={() => transition("CANCELLED", "Cancel job", "Bidders and the assigned welder are notified. This can't be undone.")} />
            ) : null}
          </View>
        ) : null}

        {v.canReview ? <ReviewForm job={job} /> : null}

        <Seam />

        {/* ── Bids ──────────────────────────────────────────────── */}
        <View className="gap-3">
          <Label accent>Bids ({job.bids.length})</Label>
          {job.bids.length === 0 ? <Text className="text-slate-500">No bids yet.</Text> : null}
          {job.bids.map((b) => (
            <Card key={b.id} className={`gap-2 p-4 ${b.status === "ACCEPTED" ? "border-green-600/40" : ""}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-body-bold text-slate-900" onPress={() => router.push({ pathname: "/welder/[id]", params: { id: b.welderId } })}>
                    {b.welderName}
                  </Text>
                  {b.welderVerified ? <BadgeCheck size={15} color={colors.green} /> : null}
                </View>
                <Text className="font-body-bold text-brand">{formatDollars(b.amount)}</Text>
              </View>
              {b.message ? <Text className="text-[14px] text-slate-600">{b.message}</Text> : null}
              <View className="flex-row items-center justify-between">
                <Badge {...BID_STATUS[b.status]} />
                <Text className="text-[12px] text-slate-400">{timeAgo(b.createdAt)}</Text>
              </View>
              {v.isOwner && job.status !== "CANCELLED" ? (
                <View className="mt-1 flex-row gap-2">
                  {job.status === "OPEN" && b.status === "PENDING" ? (
                    <Button title="Accept" size="sm" className="flex-1" loading={m.accept.isPending && m.accept.variables === b.id} onPress={() => accept(b)} />
                  ) : null}
                  <Button
                    title="Message"
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onPress={() => router.push({ pathname: "/job/[id]/chat", params: { id: job.id, to: b.welderId, name: b.welderName } })}
                  />
                </View>
              ) : null}
            </Card>
          ))}
        </View>

        {job.status === "COMPLETED" && job.reviews.length ? (
          <View className="gap-3">
            <Label accent>Reviews</Label>
            {job.reviews.map((r) => (
              <Card key={r.id} className="gap-1.5 p-4">
                <Stars value={r.rating} />
                {r.comment ? <Text className="text-slate-700">{r.comment}</Text> : null}
                <Text className="text-[12px] text-slate-500">— {r.authorName}, {formatDate(r.createdAt)}</Text>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BidForm({ job }: { job: JobDetail }) {
  const { bid } = useJobMutations(job.id);
  const [amount, setAmount] = useState(job.budget ? String(job.budget) : "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const n = Number.parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) return setError("Enter your price in whole dollars.");
    setError(null);
    bid.mutate({ amount: n, message: message.trim() }, { onError: (e) => setError(errorMessage(e)) });
  }

  return (
    <Card className="gap-4 p-4">
      <Heading className="text-[20px]">Place a bid</Heading>
      <Field label="Your price (CAD)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="e.g. 450" />
      <Field label="Message to the customer" value={message} onChangeText={setMessage} multiline placeholder="Your approach, timing, certifications…" maxLength={2000} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button title="Submit bid" loading={bid.isPending} onPress={submit} />
    </Card>
  );
}

function ReviewForm({ job }: { job: JobDetail }) {
  const { review } = useJobMutations(job.id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const welder = job.bids.find((b) => b.status === "ACCEPTED");
  return (
    <Card className="gap-4 p-4">
      <Heading className="text-[20px]">Review {welder?.welderName ?? "the welder"}</Heading>
      <Stars value={rating} size={28} onChange={setRating} />
      <Field label="Comment" value={comment} onChangeText={setComment} multiline placeholder="Quality, timing, communication…" maxLength={2000} />
      <Button
        title="Post review"
        loading={review.isPending}
        onPress={() => review.mutate({ rating, comment: comment.trim() }, { onError: (e) => Alert.alert("Couldn't post the review", errorMessage(e)) })}
      />
    </Card>
  );
}
