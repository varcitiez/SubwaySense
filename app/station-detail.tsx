import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { TrainArrivals } from "@/components/TrainArrivals";
import { LiveStationStatusComponent } from "@/components/LiveStationStatus";
import { SafetyAlertsComponent } from "@/components/SafetyAlerts";
import { useRealTime } from "@/contexts/RealTimeContext";
import type { Station } from "@/types/mta";

export default function StationDetailScreen() {
  const params = useLocalSearchParams();
  const { refreshData, isLoading, isOnline } = useRealTime();
  
  const station: Station = params.station 
    ? JSON.parse(params.station as string) 
    : null;
  const lineColor = params.lineColor as string;
  const lineIcons = params.lineIcons ? JSON.parse(params.lineIcons as string) : [];

  if (!station) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Station data not available</Text>
      </View>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "#34C759";
    if (score >= 6) return "#FFCC00";
    return "#FF3B30";
  };

  const getMetricColor = (key: string, value: string | number): string => {
    if (typeof value === "number") {
      if (key.includes("Incidents")) {
        if (value <= 2) return "#34C759";
        if (value <= 5) return "#FFCC00";
        return "#FF3B30";
      }
      return "#FFFFFF";
    }

    const lowerValue = value.toLowerCase();
    if (lowerValue === "good" || lowerValue === "high" || lowerValue === "very high") {
      return "#34C759";
    }
    if (lowerValue === "moderate" || lowerValue === "medium") {
      return "#FFCC00";
    }
    if (lowerValue === "poor" || lowerValue === "low") {
      return "#FF3B30";
    }
    return "#FFFFFF";
  };

  const getMetricIcon = (key: string) => {
    if (key.includes("Lighting")) return <Ionicons name="bulb-outline" color="#8E8E93" size={20} />;
    if (key.includes("Camera")) return <Ionicons name="camera-outline" color="#8E8E93" size={20} />;
    if (key.includes("Incidents")) return <Ionicons name="warning-outline" color="#8E8E93" size={20} />;
    if (key.includes("Traffic")) return <Ionicons name="people-outline" color="#8E8E93" size={20} />;
    return null;
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: station.stationName,
          headerStyle: {
            backgroundColor: "#1C1C1E",
          },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <TouchableOpacity 
              onPress={refreshData}
              disabled={isLoading}
              style={styles.headerButton}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={isLoading ? "#8E8E93" : "#FFFFFF"}
                style={isLoading ? styles.spinning : undefined}
              />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {!isOnline && (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineText}>📶 Offline - Showing cached data</Text>
          </View>
        )}

        <View style={styles.scoreSection}>
          <View style={[styles.lineIndicator, { backgroundColor: lineColor }]} />
          <Text style={styles.scoreLabel}>Overall Safety Score</Text>
          <Text style={[styles.score, { color: getScoreColor(station.overallScore) }]}>
            {station.overallScore}
          </Text>
          <Text style={styles.scoreMax}>/ 10</Text>
        </View>

        <TrainArrivals stationId={station.id} lineColor={lineColor} />
        
        <LiveStationStatusComponent stationId={station.id} lineIcons={lineIcons} />
        
        <SafetyAlertsComponent stationId={station.id} lineIcons={lineIcons} />

        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Safety Metrics</Text>
          
          {Object.entries(station.metrics).map(([key, value]) => (
            <View key={key} style={styles.metricItem}>
              <View style={styles.metricLeft}>
                {getMetricIcon(key)}
                <Text style={styles.metricKey}>{key}</Text>
              </View>
              <Text style={[styles.metricValue, { color: getMetricColor(key, value) }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Station ID</Text>
            <Text style={styles.infoValue}>{station.id}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Station Name</Text>
            <Text style={styles.infoValue}>{station.stationName}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#2C2C2E",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  lineIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 8,
  },
  score: {
    fontSize: 64,
    fontWeight: "bold",
  },
  scoreMax: {
    fontSize: 20,
    color: "#8E8E93",
    marginTop: -8,
  },
  metricsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metricKey: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#8E8E93",
  },
  infoValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  offlineNotice: {
    backgroundColor: '#FF9500',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

});