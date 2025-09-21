import React, { useEffect, useState } from "react";
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
import { transiterStationService } from "@/services/transiterStationService";
import { mlTrafficService } from "@/services/mlTrafficService";
import type { Station } from "@/types/mta";

export default function StationDetailScreen() {
  const params = useLocalSearchParams();
  const { refreshData, isLoading, isOnline } = useRealTime();
  const [enhancedStationData, setEnhancedStationData] = useState<any>(null);
  const [isLoadingEnhanced, setIsLoadingEnhanced] = useState<boolean>(false);
  const [mlBusynessScore, setMlBusynessScore] = useState<number | null>(null);
  const [isLoadingMlScores, setIsLoadingMlScores] = useState<boolean>(false);
  
  const station: Station = params.station 
    ? JSON.parse(params.station as string) 
    : null;
  const lineColor = params.lineColor as string;
  const lineIcons = params.lineIcons ? JSON.parse(params.lineIcons as string) : [];

  // Fetch enhanced station data from Transiter
  useEffect(() => {
    const fetchEnhancedData = async () => {
      if (!station?.id) return;
      
      setIsLoadingEnhanced(true);
      try {
        console.log(`🔍 Fetching enhanced data for station ${station.id}...`);
        const data = await transiterStationService.getStationData(station.id);
        setEnhancedStationData(data);
        console.log(`✅ Enhanced data loaded:`, data ? 'Yes' : 'No');
      } catch (error) {
        console.error('❌ Failed to fetch enhanced station data:', error);
        setEnhancedStationData(null);
      } finally {
        setIsLoadingEnhanced(false);
      }
    };

    fetchEnhancedData();
  }, [station?.id]);

  // Fetch ML busyness score when station is loaded
  useEffect(() => {
    const fetchMlScores = async () => {
      if (!station?.stationName) return;
      
      setIsLoadingMlScores(true);
      try {
        console.log(`🤖 Fetching ML busyness score for ${station.stationName}...`);
        const mlScore = await mlTrafficService.getBusynessScore(station.stationName);
        setMlBusynessScore(mlScore);
        console.log(`✅ ML busyness score loaded: ${mlScore}/10`);
      } catch (error) {
        console.error('❌ Failed to fetch ML busyness score:', error);
        setMlBusynessScore(null);
      } finally {
        setIsLoadingMlScores(false);
      }
    };

    fetchMlScores();
  }, [station?.stationName]);

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

        {/* Safety Scores Section */}
        <View style={styles.scoresSection}>
          {/* Overall Safety Score - Emphasized */}
          <View style={styles.overallScoreSection}>
            <View style={[styles.lineIndicator, { backgroundColor: lineColor }]} />
            <Text style={styles.overallScoreLabel}>Overall Safety Score</Text>
            <Text style={[styles.overallScore, { color: getScoreColor(station.overallScore) }]}>
              {station.overallScore}
            </Text>
            <Text style={styles.overallScoreMax}>/ 10</Text>
          </View>

          {/* Individual Scores */}
          <View style={styles.individualScoresContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>
                Busyness Score {mlBusynessScore !== null ? '(ML)' : ''}
              </Text>
              {isLoadingMlScores ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.scoreCardValue, { color: getScoreColor(mlBusynessScore || station.busynessScore) }]}>
                    {mlBusynessScore || station.busynessScore}
                  </Text>
                  <Text style={styles.scoreCardMax}>/ 10</Text>
                </>
              )}
            </View>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardLabel}>Crime Score</Text>
              <Text style={[styles.scoreCardValue, { color: getScoreColor(station.crimeScore) }]}>
                {station.crimeScore}
              </Text>
              <Text style={styles.scoreCardMax}>/ 10</Text>
            </View>
          </View>
        </View>

        <TrainArrivals stationId={station.id} lineColor={lineColor} />
        
        <LiveStationStatusComponent 
          stationId={station.id} 
          lineIcons={lineIcons} 
          stationName={station.stationName}
        />
        
        <SafetyAlertsComponent 
          stationId={station.id} 
          lineIcons={lineIcons} 
          stationName={station.stationName}
        />

        {/* Enhanced Station Information */}
        {enhancedStationData && (
          <View style={styles.enhancedSection}>
            <Text style={styles.sectionTitle}>Station Details</Text>
            
            {/* Coordinates */}
            {enhancedStationData.coordinates && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="location-outline" color="#8E8E93" size={20} />
                  <Text style={styles.infoLabel}>Coordinates</Text>
                </View>
                <Text style={styles.infoValue}>
                  {enhancedStationData.coordinates.latitude.toFixed(6)}, {enhancedStationData.coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {/* Routes */}
            {enhancedStationData.routes && enhancedStationData.routes.length > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="train-outline" color="#8E8E93" size={20} />
                  <Text style={styles.infoLabel}>Routes</Text>
                </View>
                <View style={styles.routeTags}>
                  {enhancedStationData.routes.map((route: string) => (
                    <View 
                      key={route} 
                      style={[
                        styles.routeTag, 
                        { backgroundColor: enhancedStationData.routeColors[route] || '#8E8E93' }
                      ]}
                    >
                      <Text style={[
                        styles.routeTagText,
                        { color: route === 'L' ? '#000000' : '#FFFFFF' }
                      ]}>
                        {route}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Transfers */}
            {enhancedStationData.transfers && enhancedStationData.transfers.length > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="swap-horizontal-outline" color="#8E8E93" size={20} />
                  <Text style={styles.infoLabel}>Transfers</Text>
                </View>
                <Text style={styles.infoValue}>
                  {enhancedStationData.transfers.join(', ')}
                </Text>
              </View>
            )}

            {/* Platforms */}
            {enhancedStationData.platforms && enhancedStationData.platforms.length > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="layers-outline" color="#8E8E93" size={20} />
                  <Text style={styles.infoLabel}>Platforms</Text>
                </View>
                <Text style={styles.infoValue}>
                  {enhancedStationData.platforms.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* <View style={styles.metricsSection}>
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
        </View> */}

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
  scoresSection: {
    backgroundColor: "#2C2C2E",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  overallScoreSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
    marginBottom: 20,
  },
  lineIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 16,
  },
  overallScoreLabel: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  overallScore: {
    fontSize: 72,
    fontWeight: "bold",
  },
  overallScoreMax: {
    fontSize: 24,
    color: "#8E8E93",
    marginTop: -8,
  },
  individualScoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  scoreCardLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    textAlign: "center",
  },
  scoreCardValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  scoreCardMax: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: -4,
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
  enhancedSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
  },
  routeTagText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
  },
});