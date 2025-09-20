import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Station } from "@/types/mta";

export default function StationListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const stations: Station[] = params.stations 
    ? JSON.parse(params.stations as string) 
    : [];
  const lineName = params.lineName as string;
  const lineColor = params.lineColor as string;
  const lineIcons = params.lineIcons ? JSON.parse(params.lineIcons as string) : [];

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "#34C759";
    if (score >= 6) return "#FFCC00";
    return "#FF3B30";
  };

  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => {
        router.push({
          pathname: "/station-detail",
          params: { 
            station: JSON.stringify(item),
            lineColor: lineColor,
            lineIcons: JSON.stringify(lineIcons)
          },
        });
      }}
      testID={`station-${item.id}`}
    >
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.stationName}</Text>
        <Text style={styles.stationId}>Station ID: {item.id}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: getScoreColor(item.overallScore) }]}>
          {item.overallScore}
        </Text>
        <Text style={styles.scoreLabel}>/ 10 Safety Rating</Text>
        <Ionicons name="chevron-forward" color="#8E8E93" size={20} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: lineName,
          headerStyle: {
            backgroundColor: "#1C1C1E",
          },
          headerTintColor: "#FFFFFF",
        }} 
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.lineIndicator, { backgroundColor: lineColor }]} />
          <Text style={styles.headerText}>{stations.length} Stations</Text>
        </View>
        
        <FlatList
          data={stations}
          renderItem={renderStationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  lineIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stationId: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 16,
    color: "#8E8E93",
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 12,
  },
  separator: {
    height: 12,
  },
});