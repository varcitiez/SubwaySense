import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRealTime } from "@/contexts/RealTimeContext";


export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const { isOnline, lastUpdated } = useRealTime();

  const handleSafetyPress = () => {
    router.push("/lines");
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.5, 3);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.5, 1);
    setZoomLevel(newZoom);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      
      {/* Header with Safety Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>SafeRoute</Text>
          <Text style={styles.appSubtitle}>NYC Subway Map</Text>
        </View>
        <TouchableOpacity 
          style={styles.safetyButton}
          onPress={handleSafetyPress}
          testID="safety-button"
        >
          <Text style={styles.cautionIcon}>⚠️</Text>
          <Text style={styles.safetyButtonText}>Safety</Text>
        </TouchableOpacity>
      </View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetZoom}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Zoomable Subway Map */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mapContainer}
        contentContainerStyle={[
          styles.mapContent,
          {
            width: screenWidth * zoomLevel,
            height: (screenHeight - 200) * zoomLevel,
          },
        ]}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={3}
        minimumZoomScale={1}
        bounces={false}
        scrollEnabled={zoomLevel > 1}
      >
        <Image
          source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/g061w302zt2agklgz1wk6" }}
          style={[
            styles.mapImage,
            {
              width: screenWidth * zoomLevel,
              height: (screenHeight - 200) * zoomLevel,
            },
          ]}
          contentFit="contain"
          transition={200}
        />
      </ScrollView>

      {/* Bottom Info */}
      <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.statusRow}>
          <Text style={styles.infoText}>Tap the Safety button to view station safety information</Text>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#34C759' : '#FF3B30' }]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Live' : 'Offline'}
            </Text>
          </View>
        </View>
        <Text style={styles.subInfoText}>Use zoom controls to explore the map in detail</Text>
        {lastUpdated && (
          <Text style={styles.lastUpdateText}>
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  appSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  safetyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cautionIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  safetyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  zoomControls: {
    position: "absolute",
    top: 120,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    padding: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  zoomButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  mapContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  mapImage: {
    backgroundColor: "#000000",
  },
  bottomInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  subInfoText: {
    color: "#8E8E93",
    fontSize: 14,
    textAlign: "center",
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  lastUpdateText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});