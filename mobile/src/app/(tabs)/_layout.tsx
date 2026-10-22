import { NativeTabs } from "expo-router/native-tabs";
import { useAuth } from "@/lib/auth";
import { useMe } from "@/lib/queries";
import { colors } from "@/components/ui";

/**
 * Tabs by role (Android shows at most five):
 *
 *   guest     Home · Shop · Jobs · Account
 *   customer  Home · Shop · My jobs · Cart · Account
 *   welder    Home · Find work · Shop · Cart · Account
 *   supplier  Home · Sales · Shop · Cart · Account
 *
 * Triggers are declared statically and hidden per role; the navigator is
 * keyed on the role so it mounts fresh when someone signs in or out, which is
 * what native tabs expect when the set of visible tabs changes.
 */
export default function TabsLayout() {
  const { user } = useAuth();
  const { data: me } = useMe();
  const role = user?.role ?? "GUEST";
  const isSupplier = role === "SUPPLIER";
  const cartCount = me?.cartCount ?? 0;

  return (
    <NativeTabs
      key={role}
      tintColor={colors.brand}
      backgroundColor={colors.panel}
      labelStyle={{ fontFamily: "Barlow_600SemiBold", fontSize: 11 }}
      // Android: Material shows only the selected tab's label by default, which
      // leaves four bare icons; and its default indicator is off-brand lavender.
      labelVisibilityMode="labeled"
      indicatorColor={colors.pressed}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="jobs" hidden={isSupplier}>
        <NativeTabs.Trigger.Label>{role === "CUSTOMER" ? "My jobs" : role === "WELDER" ? "Find work" : "Jobs"}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "wrench.and.screwdriver", selected: "wrench.and.screwdriver.fill" }} md="construction" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sales" hidden={!isSupplier}>
        <NativeTabs.Trigger.Label>Sales</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "shippingbox", selected: "shippingbox.fill" }} md="inventory_2" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "bag", selected: "bag.fill" }} md="storefront" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart" hidden={role === "GUEST"}>
        <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "cart", selected: "cart.fill" }} md="shopping_cart" />
        {cartCount > 0 ? <NativeTabs.Trigger.Badge>{cartCount > 99 ? "99+" : String(cartCount)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
