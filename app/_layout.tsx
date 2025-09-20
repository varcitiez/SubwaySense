import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { RealTimeProvider } from "@/contexts/RealTimeContext";
import { LocationProvider } from "@/contexts/LocationContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#1C1C1E",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: "#1C1C1E",
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "SafeRoute MTA",
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="lines" 
        options={{ 
          title: "SafeRoute MTA" 
        }} 
      />
      <Stack.Screen 
        name="stations" 
        options={{ 
          title: "Stations" 
        }} 
      />
      <Stack.Screen 
        name="station-detail" 
        options={{ 
          title: "Station Details" 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RealTimeProvider>
        <LocationProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </LocationProvider>
      </RealTimeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});