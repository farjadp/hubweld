import type { ReactNode } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { ChevronRight, FileText, LogOut, Package, Settings, Shield, Trash2, User, Users, Wrench } from "lucide-react-native";
import { SignInPrompt } from "@/components/SignInPrompt";
import { RemoteImage } from "@/components/RemoteImage";
import { TabHeader } from "@/components/TabHeader";
import { Badge, Card, Label, Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useMe } from "@/lib/queries";
import { API_URL } from "@/lib/config";

const ROLE_LABEL: Record<string, string> = { CUSTOMER: "Customer", WELDER: "Welder", SUPPLIER: "Supplier", ADMIN: "Admin" };

function Item({ icon, label, onPress, danger }: { icon: ReactNode; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-row items-center gap-3 px-4 py-3.5 active:bg-raised">
      {icon}
      <Text className={`flex-1 font-body-medium ${danger ? "text-brand" : "text-slate-800"}`}>{label}</Text>
      <ChevronRight size={18} color={colors.slate400} />
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-6">
      <Label className="mb-2 ml-1">{title}</Label>
      <Card className="overflow-hidden">{children}</Card>
    </View>
  );
}

const Divider = () => <View className="ml-12 h-px bg-slate-100" />;

export default function Account() {
  const { user, signOut } = useAuth();
  const me = useMe();
  const icon = (I: typeof User, c: string = colors.slate500) => <I size={20} color={c} />;

  const legal = (
    <Group title="About">
      <Item icon={icon(Users)} label="Find welders" onPress={() => router.push("/welders")} />
      <Divider />
      <Item icon={icon(Shield)} label="Privacy policy" onPress={() => void Linking.openURL(`${API_URL}/privacy`)} />
      <Divider />
      <Item icon={icon(FileText)} label="Terms of service" onPress={() => void Linking.openURL(`${API_URL}/terms`)} />
    </Group>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-ground">
        <TabHeader title="Account" />
        <ScrollView contentContainerClassName="px-5 pb-12">
          <SignInPrompt title="Your HubWeld account" body="Sign in to post jobs, bid, order supplies and get notified when something changes." />
          {legal}
        </ScrollView>
      </View>
    );
  }

  const avatar = me.data?.welderProfile?.avatarUrl || me.data?.supplierProfile?.logoUrl;
  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll stop getting notifications on this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  return (
    <View className="flex-1 bg-ground">
      <TabHeader title="Account" />
      <ScrollView contentContainerClassName="px-5 pb-16 pt-4">
        <Card className="flex-row items-center gap-4 p-4">
          {avatar ? (
            <RemoteImage uri={avatar} label={user.name} className="h-14 w-14 rounded-full" />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-full bg-recess">
              <User size={26} color={colors.slate400} />
            </View>
          )}
          <View className="flex-1 gap-1">
            <Text className="font-body-bold text-[17px] text-slate-900">{me.data?.supplierProfile?.businessName || user.name}</Text>
            <Text className="text-[13px] text-slate-500">{user.email}</Text>
            <Badge label={ROLE_LABEL[user.role] ?? user.role} tone="neutral" />
          </View>
        </Card>

        <Group title="Your activity">
          <Item icon={icon(Package)} label="My orders" onPress={() => router.push("/orders")} />
          {user.role === "WELDER" ? (
            <>
              <Divider />
              <Item icon={icon(Wrench)} label="Welder profile" onPress={() => router.push("/account/welder-profile")} />
            </>
          ) : null}
        </Group>

        <Group title="Settings">
          <Item icon={icon(Settings)} label="Account details & password" onPress={() => router.push("/account/details")} />
          <Divider />
          <Item icon={icon(LogOut)} label="Sign out" onPress={confirmSignOut} />
          {user.role !== "ADMIN" ? (
            <>
              <Divider />
              <Item icon={icon(Trash2, colors.brand)} label="Delete account" danger onPress={() => router.push("/account/delete")} />
            </>
          ) : null}
        </Group>

        {legal}

        <Text className="mt-8 text-center font-mono text-[11px] text-slate-400">
          HubWeld {Constants.expoConfig?.version ?? ""}
        </Text>
      </ScrollView>
    </View>
  );
}
