import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { focusManager } from "@tanstack/react-query";

/**
 * React Query only knows a browser tab's focus. On a phone, "focus" means two
 * things it cannot see on its own:
 *
 *  - the app coming back to the foreground (wired once, below), and
 *  - a screen becoming visible again after something was pushed on top of it
 *    (useRefetchOnFocus) — returning from a chat to a job whose bid was
 *    accepted meanwhile must not still say "Pending".
 *
 * Push notifications also trigger a refetch, but the screen has to be right
 * when a notification never arrives (permission off, simulator, flaky network).
 */
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (state) => handleFocus(state === "active"));
  return () => sub.remove();
});

/** Refetch when this screen regains focus (not on the first mount, which already fetched). */
export function useRefetchOnFocus(...refetchers: (() => unknown)[]) {
  const first = useRef(true);
  const fns = useRef(refetchers);
  useEffect(() => {
    fns.current = refetchers;
  });
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      fns.current.forEach((f) => void f());
    }, [])
  );
}
