import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, Pressable, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SendHorizontal } from "lucide-react-native";
import { Chips } from "@/components/Chips";
import { Empty, ErrorState, Loading, Notice, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { useJob, useMessages, useSendMessage } from "@/lib/queries";
import { timeAgo } from "@/lib/format";

/**
 * A job's conversation. A welder always talks to the customer. The customer
 * talks to the hired welder, or before hiring picks which bidder (`?to=`);
 * each bidder sees only their own thread (enforced by the API).
 */
export default function Chat() {
  const { id, to, name } = useLocalSearchParams<{ id: string; to?: string; name?: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const job = useJob(id);
  const messages = useMessages(id);
  const send = useSendMessage(id);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const isOwner = job.data?.viewer.isOwner ?? false;
  const hired = job.data?.bids.find((b) => b.status === "ACCEPTED");
  const bidders = useMemo(() => {
    const seen = new Map<string, string>();
    job.data?.bids.forEach((b) => seen.set(b.welderId, b.welderName));
    return [...seen].map(([value, label]) => ({ value, label }));
  }, [job.data]);
  const [chosen, setPeer] = useState<string>(to ?? "");
  // Hired welder, else the only bidder, else whoever the customer picks.
  const peer = isOwner ? chosen || hired?.welderId || (bidders.length === 1 ? bidders[0].value : "") : "";

  // The owner's feed holds every bidder's messages; show one conversation at a time.
  const thread = useMemo(() => {
    const all = messages.data ?? [];
    if (!isOwner || !peer) return all;
    return all.filter((m) => m.fromId === peer || m.toId === peer);
  }, [messages.data, isOwner, peer]);

  useEffect(() => {
    if (thread.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [thread.length]);

  const title = isOwner ? bidders.find((b) => b.value === peer)?.label ?? name ?? "Messages" : job.data?.customer.name ?? "Messages";
  const needsPeer = isOwner && !peer;

  function submit() {
    const text = body.trim();
    if (!text || needsPeer) return;
    setError(null);
    send.mutate(
      { body: text, toId: isOwner && !hired ? peer : undefined },
      { onSuccess: () => setBody(""), onError: (e) => setError(errorMessage(e)) }
    );
  }

  if (job.isPending || messages.isPending) return <Loading />;
  if (messages.isError) return <ErrorState error={messages.error} onRetry={() => void messages.refetch()} />;

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top + (Platform.OS === "ios" ? 44 : 56)} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: title }} />
      {isOwner && !hired && bidders.length > 1 ? (
        <View className="border-b border-slate-200 py-2">
          <Chips value={peer} onChange={setPeer} options={bidders} allLabel={null} />
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={thread}
        keyExtractor={(m) => m.id}
        contentContainerClassName="gap-2 px-4 py-4"
        ListEmptyComponent={<Empty title={needsPeer ? "Pick a welder" : "No messages yet"} body={needsPeer ? "Choose which bidder you want to talk to." : `Ask about ${job.data?.title ?? "the job"}.`} />}
        renderItem={({ item }) => {
          const mine = item.fromId === user?.id;
          return (
            <View className={`max-w-[82%] gap-1 rounded-sm px-3.5 py-2.5 ${mine ? "self-end bg-slate-900" : "self-start border border-slate-200 bg-panel"}`}>
              <Text className={mine ? "text-white" : "text-slate-800"}>{item.body}</Text>
              <Text className={`text-[11px] ${mine ? "text-slate-300" : "text-slate-400"}`}>{timeAgo(item.createdAt)}</Text>
            </View>
          );
        }}
      />

      {error ? <View className="px-4 pb-2"><Notice tone="error">{error}</Notice></View> : null}
      {job.data?.status === "CANCELLED" ? (
        <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 8 }}><Notice>This job was cancelled, so the conversation is closed.</Notice></View>
      ) : (
        <View className="flex-row items-end gap-2 border-t border-slate-200 bg-panel px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={needsPeer ? "Pick a welder first" : "Message"}
            editable={!needsPeer}
            multiline
            maxLength={4000}
            placeholderTextColor={colors.slate400}
            selectionColor={colors.brand}
            className="max-h-32 flex-1 rounded-sm border border-slate-300 bg-ground px-3 py-2.5 font-body text-[16px] text-slate-900"
          />
          <Pressable
            accessibilityLabel="Send"
            disabled={!body.trim() || send.isPending || needsPeer}
            onPress={submit}
            className={`h-11 w-11 items-center justify-center rounded-sm ${body.trim() && !needsPeer ? "bg-brand" : "bg-pressed"}`}
          >
            <SendHorizontal size={20} color={body.trim() && !needsPeer ? "#fff" : colors.slate400} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
