import { router } from "expo-router";
import { Button, Empty } from "@/components/ui";

/** What a guest sees where an account is needed. */
export function SignInPrompt({ title, body }: { title: string; body: string }) {
  return (
    <Empty
      title={title}
      body={body}
      action={<Button title="Sign in" onPress={() => router.push("/sign-in")} />}
    />
  );
}
