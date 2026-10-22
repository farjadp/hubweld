import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { ReportReason, ReportTargetType } from "@shared/api-types";
import { FormScroll } from "@/components/FormScroll";
import { Button, Field, Heading, Label, Notice, Seam, Text } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useBlockMutations, useReport } from "@/lib/queries";

const WHAT: Record<ReportTargetType, string> = {
  JOB: "this job",
  BID: "this bid",
  REVIEW: "this review",
  MESSAGE: "this message",
  USER: "this profile",
  PRODUCT: "this product",
};

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "HARASSMENT", label: "Harassment or abuse" },
  { value: "INAPPROPRIATE", label: "Inappropriate or offensive" },
  { value: "SCAM", label: "Scam or fraud" },
  { value: "SPAM", label: "Spam or advertising" },
  { value: "OTHER", label: "Something else" },
];

/**
 * Report a piece of content and, separately, block the person behind it
 * (App Store guideline 1.2). Reached from ReportButton on every screen that
 * shows another user's content.
 */
export default function Report() {
  const { type, id, userId, name } = useLocalSearchParams<{ type: ReportTargetType; id: string; userId: string; name: string }>();
  const report = useReport();
  const { block } = useBlockMutations();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  function send() {
    if (!reason) return setError("Choose what's wrong.");
    setError(null);
    report.mutate(
      { targetType: type, targetId: id, reason, details: details.trim() || undefined },
      {
        onSuccess: () =>
          Alert.alert("Report sent", "Thank you. We review every report within 24 hours and remove anything that breaks our Terms.", [
            { text: "OK", onPress: () => router.back() },
          ]),
        onError: (e) => setError(errorMessage(e)),
      }
    );
  }

  const confirmBlock = () =>
    Alert.alert(`Block ${name}?`, "You won't see each other's jobs, bids, reviews, profile or products, and neither of you can message the other. You can unblock them from Account.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () =>
          block.mutate(userId, {
            // Their content is gone from every list now, including the screen
            // underneath, so return to the tabs rather than to an empty page.
            onSuccess: () => router.dismissAll(),
            onError: (e) => Alert.alert("Couldn't block", errorMessage(e)),
          }),
      },
    ]);

  return (
    <FormScroll contentContainerClassName="gap-5 px-5 pb-16 pt-4">
      <Heading className="text-[26px]">Report {WHAT[type] ?? "this"}</Heading>
      <Text className="leading-6 text-slate-700">
        {name} won’t be told who reported them. Our team reviews every report within 24 hours.
      </Text>

      <View className="gap-2" accessibilityRole="radiogroup">
        {REASONS.map((r) => {
          const on = reason === r.value;
          return (
            <Pressable
              key={r.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setReason(r.value)}
              className={`rounded-sm border px-4 py-3.5 ${on ? "border-brand bg-brand/5" : "border-slate-300 bg-panel active:bg-pressed"}`}
            >
              <Text className={`font-body-medium ${on ? "text-slate-900" : "text-slate-700"}`}>{r.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Field label="Details (optional)" value={details} onChangeText={setDetails} multiline maxLength={2000} placeholder="Anything that helps us understand" />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button title="Send report" loading={report.isPending} onPress={send} />

      <Seam className="my-2" />

      <View className="gap-3">
        <Label accent>Block {name}</Label>
        <Text className="leading-6 text-slate-700">Stop seeing their content and stop them from contacting you. They aren’t notified.</Text>
        <Button title={`Block ${name}`} variant="secondary" loading={block.isPending} onPress={confirmBlock} />
      </View>
    </FormScroll>
  );
}
