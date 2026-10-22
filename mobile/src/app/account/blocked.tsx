import { Alert, FlatList, View } from "react-native";
import { Button, Card, Empty, ErrorState, Loading, Text } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { useBlockMutations, useBlockedUsers } from "@/lib/queries";
import { formatDate } from "@/lib/format";

const ROLE_LABEL: Record<string, string> = { CUSTOMER: "Customer", WELDER: "Welder", SUPPLIER: "Supplier", ADMIN: "Admin" };

/** Everyone the user has blocked, with a way to undo it. */
export default function Blocked() {
  const blocked = useBlockedUsers();
  const { unblock } = useBlockMutations();

  if (blocked.isPending) return <Loading />;
  if (blocked.isError) return <ErrorState error={blocked.error} onRetry={() => void blocked.refetch()} />;

  return (
    <FlatList
      data={blocked.data}
      keyExtractor={(u) => u.id}
      contentContainerClassName="gap-3 px-5 pb-16 pt-4"
      ListEmptyComponent={<Empty title="No one blocked" body="Block someone from the flag on their profile, job, bid, review or a message." />}
      renderItem={({ item }) => (
        <Card className="flex-row items-center gap-3 p-4">
          <View className="flex-1 gap-0.5">
            <Text className="font-body-bold text-slate-900">{item.name}</Text>
            <Text className="text-[13px] text-slate-500">{ROLE_LABEL[item.role] ?? item.role} · blocked {formatDate(item.blockedAt)}</Text>
          </View>
          <Button
            title="Unblock"
            size="sm"
            variant="secondary"
            loading={unblock.isPending && unblock.variables === item.id}
            onPress={() => unblock.mutate(item.id, { onError: (e) => Alert.alert("Couldn't unblock", errorMessage(e)) })}
          />
        </Card>
      )}
    />
  );
}
