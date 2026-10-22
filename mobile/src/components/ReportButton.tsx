import { Pressable } from "react-native";
import { router } from "expo-router";
import { Flag } from "lucide-react-native";
import type { ReportTargetType } from "@shared/api-types";
import { Text, colors } from "@/components/ui";
import { useAuth } from "@/lib/auth";

type Props = {
  type: ReportTargetType;
  id: string;
  /** Whose content it is. Hidden for the viewer's own content; offers Block on the report screen. */
  userId: string;
  name: string;
  /** "header" is an icon for a screen's header; "inline" a small link under a bid, review or message. */
  look?: "header" | "inline";
};

/**
 * The way into reporting and blocking, on every piece of content another user
 * wrote. Signed-out viewers are sent to sign in first: a report needs a reporter.
 */
export function ReportButton({ type, id, userId, name, look = "inline" }: Props) {
  const { user } = useAuth();
  if (user?.id === userId) return null;

  const open = () =>
    user ? router.push({ pathname: "/report", params: { type, id, userId, name } }) : router.push("/sign-in");

  if (look === "header") {
    return (
      <Pressable onPress={open} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Report or block ${name}`}>
        <Flag size={20} color={colors.slate700} />
      </Pressable>
    );
  }
  return (
    <Pressable onPress={open} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Report ${name}`} className="flex-row items-center gap-1 self-start">
      <Flag size={12} color={colors.slate400} />
      <Text className="text-[12px] text-slate-400">Report</Text>
    </Pressable>
  );
}
