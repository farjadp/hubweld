import { cookies } from "next/headers";
import { BASE_CURRENCY, CURRENCY_COOKIE, isCurrency, type Currency } from "@/lib/currency";

/**
 * The viewer's chosen display currency, from the preference cookie set by the
 * currency switcher. Server components only — kept out of currency.ts so that
 * client components can import the shared constants without pulling in
 * next/headers.
 */
export function getDisplayCurrency(): Currency {
  const v = cookies().get(CURRENCY_COOKIE)?.value;
  return isCurrency(v) ? v : BASE_CURRENCY;
}
