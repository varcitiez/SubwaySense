import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTime } from '@/contexts/RealTimeContext';
import type { TrainArrival } from '@/types/mta';

interface TrainArrivalsProps {
  stationId: string;
  lineColor: string;
}

export function TrainArrivals({ stationId, lineColor }: TrainArrivalsProps) {
  const { getStationArrivals, isOnline } = useRealTime();
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArrivals = async () => {
    setIsLoading(true);
    try {
      const data = await getStationArrivals(stationId);
      setArrivals(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch arrivals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    
    const interval = setInterval(fetchArrivals, 30000);
    return () => clearInterval(interval);
  }, [stationId]);

  const getDirectionText = (direction: string): string => {
    switch (direction) {
      case 'N': return 'Uptown';
      case 'S': return 'Downtown';
      case 'E': return 'Eastbound';
      case 'W': return 'Westbound';
      default: return direction;
    }
  };

  const getMinutesText = (minutes: number): string => {
    if (minutes <= 1) return 'Arriving';
    return `${minutes} min`;
  };

  const formatLastUpdated = (): string => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diff < 60) return 'Just updated';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          <Text style={styles.title}>Live Arrivals</Text>
          <View style={styles.statusIndicator}>
            {isOnline ? (
              <Ionicons name="wifi" size={16} color="#34C759" />
            ) : (
              <Ionicons name="wifi-outline" size={16} color="#FF3B30" />
            )}
          </View>
        </View>
        
        <View style={styles.updateRow}>
          <Text style={styles.lastUpdated}>{formatLastUpdated()}</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchArrivals}
            disabled={isLoading}
          >
            <Ionicons 
              name="refresh" 
              size={16} 
              color={isLoading ? "#8E8E93" : "#007AFF"} 
              style={isLoading ? styles.spinning : undefined}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && arrivals.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading arrivals...</Text>
        </View>
      ) : arrivals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No upcoming trains</Text>
          <Text style={styles.emptySubtext}>Check back in a few minutes</Text>
        </View>
      ) : (
        <View style={styles.arrivalsList}>
          {arrivals.map((arrival) => (
            <View key={arrival.trainId} style={styles.arrivalItem}>
              <View style={styles.trainInfo}>
                <View style={[styles.lineBadge, { backgroundColor: lineColor }]}>
                  <Text style={styles.lineText}>{arrival.line}</Text>
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destination}>{arrival.destination}</Text>
                  <Text style={styles.direction}>{getDirectionText(arrival.direction)}</Text>
                </View>
              </View>
              
              <View style={styles.timeInfo}>
                <Text style={[
                  styles.arrivalTime,
                  arrival.isDelayed && styles.delayedTime,
                  arrival.minutesAway <= 1 && styles.arrivingTime
                ]}>
                  {getMinutesText(arrival.minutesAway)}
                </Text>
                {arrival.isDelayed && (
                  <Text style={styles.delayedLabel}>Delayed</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#8E8E93',
  },
  refreshButton: {
    padding: 4,
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#8E8E93',
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  arrivalsList: {
    gap: 12,
  },
  arrivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  trainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lineBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  destinationInfo: {
    flex: 1,
  },
  destination: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  direction: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  arrivalTime: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  delayedTime: {
    color: '#FF9500',
  },
  arrivingTime: {
    color: '#FF3B30',
  },
  delayedLabel: {
    color: '#FF9500',
    fontSize: 11,
    marginTop: 2,
  },
});