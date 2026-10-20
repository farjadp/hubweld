import "../global.css";

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Barlow_400Regular } from "@expo-google-fonts/barlow/400Regular";
import { Barlow_500Medium } from "@expo-google-fonts/barlow/500Medium";
import { Barlow_600SemiBold } from "@expo-google-fonts/barlow/600SemiBold";
import { Barlow_700Bold } from "@expo-google-fonts/barlow/700Bold";
import { BarlowCondensed_600SemiBold } from "@expo-google-fonts/barlow-condensed/600SemiBold";
import { BarlowCondensed_700Bold } from "@expo-google-fonts/barlow-condensed/700Bold";
import { IBMPlexMono_500Medium } from "@expo-google-fonts/ibm-plex-mono/500Medium";
import { AuthProvider, useAuth } from "@/lib/auth";
import { usePushNotifications } from "@/lib/push";
import { ApiError } from "@/lib/api";
import { colors } from "@/components/ui";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // A 4xx will not fix itself on retry; a dropped connection might.
            retry: (count, e) => !(e instanceof ApiError && e.status < 500) && count < 2,
          },
        },
      })
  );
  const [fontsLoaded, fontError] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    IBMPlexMono_500Medium,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        {fontsLoaded || fontError ? <RootStack /> : null}
      </AuthProvider>
    </QueryClientProvider>
  );
}

const detailHeader = {
  headerShown: true,
  headerTitle: "",
  headerBackButtonDisplayMode: "minimal" as const,
  headerTintColor: colors.slate900,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.ground },
};

function RootStack() {
  const { status } = useAuth();
  const signedIn = status === "signedIn";
  usePushNotifications();

  useEffect(() => {
    if (status !== "loading") void SplashScreen.hideAsync();
  }, [status]);
  if (status === "loading") return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
      <Stack.Screen name="(tabs)" />

      {/* Public: anyone may browse the catalogue, open jobs and welders. */}
      <Stack.Screen name="product/[id]" options={detailHeader} />
      <Stack.Screen name="job/[id]/index" options={detailHeader} />
      <Stack.Screen name="welder/[id]" options={detailHeader} />
      <Stack.Screen name="welders" options={{ ...detailHeader, headerTitle: "Find welders" }} />

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ presentation: "modal" }} />
        <Stack.Screen name="sign-up" options={{ presentation: "modal" }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="job/[id]/chat" options={{ ...detailHeader, headerTitle: "Messages" }} />
        <Stack.Screen name="job/new" options={{ ...detailHeader, presentation: "modal", headerTitle: "Post a job" }} />
        <Stack.Screen name="checkout" options={{ ...detailHeader, headerTitle: "Checkout" }} />
        <Stack.Screen name="orders" options={{ ...detailHeader, headerTitle: "My orders" }} />
        <Stack.Screen name="order/[id]" options={detailHeader} />
        <Stack.Screen name="account/details" options={{ ...detailHeader, headerTitle: "Account details" }} />
        <Stack.Screen name="account/welder-profile" options={{ ...detailHeader, headerTitle: "Welder profile" }} />
        <Stack.Screen name="account/delete" options={{ ...detailHeader, headerTitle: "Delete account" }} />
        <Stack.Screen name="supplier/product" options={{ ...detailHeader, presentation: "modal", headerTitle: "Product" }} />
      </Stack.Protected>
    </Stack>
  );
}
