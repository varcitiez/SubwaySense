import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { MTAData, Line, Station } from "@/types/mta";
// import { HARDCODED_MTA_DATA } from "@/constants/mtaData"; // Removed - using Transiter data only
import { transiterRouteService } from "@/services/transiterRouteService";

export default function LineListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [data, setData] = useState<MTAData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Transiter data on component mount
  useEffect(() => {
    const fetchTransiterData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🚇 Fetching routes and stations from Transiter...');
        const transiterLines = await transiterRouteService.getAllRoutesWithStations();
        
        if (transiterLines.length > 0) {
          console.log(`✅ Successfully loaded ${transiterLines.length} lines with stations from Transiter`);
          setData({ lines: transiterLines });
        } else {
          console.log('⚠️ No Transiter data available');
          setData(null);
        }
      } catch (error) {
        console.error('❌ Failed to fetch Transiter data:', error);
        setError('Failed to load real-time data');
        setData(null); // No fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransiterData();
  }, []);

  const searchResults = useMemo(() => {
    if (!data || !searchQuery.trim()) return null;

    const results: { station: Station; line: Line }[] = [];
    const stationIds = new Set<string>(); // Track seen station IDs to avoid duplicates
    
    data.lines.forEach((line) => {
      line.stations.forEach((station) => {
        if (station.stationName.toLowerCase().includes(searchQuery.toLowerCase())) {
          // Only add if we haven't seen this station ID before
          if (!stationIds.has(station.id)) {
            stationIds.add(station.id);
            results.push({ station, line });
          }
        }
      });
    });

    console.log(`🔍 Search for "${searchQuery}" found ${results.length} unique stations`);
    return results;
  }, [data, searchQuery]);

  const renderLineItem = ({ item }: { item: Line }) => (
    <TouchableOpacity
      style={styles.lineItem}
      onPress={() => {
        router.push({
          pathname: "/stations",
          params: { 
            stations: JSON.stringify(item.stations),
            lineName: item.lineName,
            lineColor: item.lineColor,
            lineIcons: JSON.stringify(item.lineIcons)
          },
        });
      }}
      testID={`line-${item.lineName}`}
    >
      <View style={[styles.lineIconContainer, { backgroundColor: item.lineColor }]}>
        {item.lineIcons.map((icon) => (
          <Text
            key={icon}
            style={[
              styles.lineIcon,
              { color: item.lineColor === "#FCCC0A" ? "#000000" : "#FFFFFF" }
            ]}
          >
            {icon}
          </Text>
        ))}
      </View>
      <View style={styles.lineInfo}>
        <Text style={styles.lineName}>{item.lineName}</Text>
        <Text style={styles.aggregateSafety}>Safety: {item.aggregateSafety}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchItem = ({ item }: { item: { station: Station; line: Line } }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => {
        router.replace({
          pathname: "/station-detail",
          params: { 
            station: JSON.stringify(item.station),
            lineColor: item.line.lineColor,
            lineIcons: JSON.stringify(item.line.lineIcons)
          },
        });
      }}
      testID={`search-${item.station.id}`}
    >
      <View style={styles.searchItemContent}>
        <Text style={styles.stationName}>{item.station.stationName}</Text>
        <View style={styles.searchItemMeta}>
          <View style={[styles.smallLineIndicator, { backgroundColor: item.line.lineColor }]} />
          <Text style={styles.searchLineName}>{item.line.lineName}</Text>
        </View>
      </View>
      <Text style={styles.score}>{item.station.overallScore} / 10</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SubwaySense MTA</Text>
          <Text style={styles.subtitle}>NYC Subway Safety Tracker</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading routes and stations from Transiter...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SubwaySense MTA</Text>
          <Text style={styles.subtitle}>NYC Subway Safety Tracker</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load real-time data</Text>
          <Text style={styles.errorSubtext}>Using cached data. Pull to refresh.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              // Trigger re-fetch by updating a state
              setError(null);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SubwaySense MTA</Text>
        <Text style={styles.subtitle}>NYC Subway Safety Tracker</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" color="#8E8E93" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a station..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="search-input"
        />
      </View>

      {searchQuery.trim() && searchResults ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={(item) => `${item.station.id}-${item.line.lineName}`}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No stations found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={data?.lines || []}
          renderItem={renderLineItem}
          keyExtractor={(item, index) => `${item.lineIcons[0]}-${index}`}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  lineItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 12,
  },
  lineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  lineIcon: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 2,
  },
  lineInfo: {
    flex: 1,
    marginLeft: 16,
  },
  lineName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  aggregateSafety: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 12,
  },
  searchItemContent: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  searchItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  smallLineIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  searchLineName: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 8,
  },
  score: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A84FF",
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#8E8E93",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorSubtext: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 16,
  },
  loadingSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});