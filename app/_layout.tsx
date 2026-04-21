import { SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/InitialLayout";
import React, { useEffect } from "react";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    // GestureHandlerRootView ОБОВ'ЯЗКОВИЙ для Swipeable та будь-яких жестів
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkAndConvexProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <InitialLayout />
        </SafeAreaView>
      </ClerkAndConvexProvider>
    </GestureHandlerRootView>
  );
}