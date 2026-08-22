/**
 * Client-side mutation helper.
 *
 * Several components used to `await fetch(...)` and then refresh regardless of
 * the result, so a 403 or a validation error looked identical to success: the
 * page just did not change. This throws the server's own error message so the
 * caller can show it.
 */
export async function mutate<T = any>(
  url: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(url, {
    method: init.method ?? "POST",
    ...(init.body !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(init.body) }
      : {}),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new Error(message);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}

/** Narrow an unknown catch value to a displayable message. */
export function errorMessage(e: unknown, fallback = "Something went wrong"): string {
  return e instanceof Error && e.message ? e.message : fallback;
}
