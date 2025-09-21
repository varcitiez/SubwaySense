import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTime } from '@/contexts/RealTimeContext';
import { ServiceAlerts } from '@/components/ServiceAlerts';
import { mlTrafficService } from '@/services/mlTrafficService';
import type { LiveStationStatus } from '@/types/mta';

interface LiveStationStatusProps {
  stationId: string;
  lineIcons?: string[];
  stationName?: string;
}

export function LiveStationStatusComponent({ stationId, lineIcons, stationName }: LiveStationStatusProps) {
  const { getStationStatus } = useRealTime();
  const [status, setStatus] = useState<LiveStationStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showServiceAlerts, setShowServiceAlerts] = useState<boolean>(false);
  const [mlBusyness, setMlBusyness] = useState<{
    trafficPrediction: number | null;
    busynessLevel: any | null;
    isMLData: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        // Fetch regular status data
        const data = await getStationStatus(stationId);
        setStatus(data);

        // Fetch ML busyness prediction if station name is available
        if (stationName) {
          console.log(`🤖 Fetching ML busyness for ${stationName}...`);
          const busynessData = await mlTrafficService.getCurrentBusyness(stationName);
          setMlBusyness(busynessData);
        }
      } catch (error) {
        console.error('Failed to fetch station status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [stationId, stationName, getStationStatus]);

  const getCrowdingColor = (level: LiveStationStatus['crowdingLevel']): string => {
    switch (level) {
      case 'low': return '#34C759';
      case 'moderate': return '#FFCC00';
      case 'high': return '#FF9500';
      case 'very-high': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getCrowdingText = (level: LiveStationStatus['crowdingLevel']): string => {
    switch (level) {
      case 'low': return 'Light';
      case 'moderate': return 'Moderate';
      case 'high': return 'Busy';
      case 'very-high': return 'Very Busy';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: 'working' | 'out-of-service'): string => {
    return status === 'working' ? '#34C759' : '#FF3B30';
  };

  const getStatusText = (status: 'working' | 'out-of-service'): string => {
    return status === 'working' ? 'Working' : 'Out of Service';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="people" size={20} color="#FFFFFF" />
          <Text style={styles.title}>Live Station Status</Text>
          <TouchableOpacity 
            style={styles.alertsButton}
            onPress={() => setShowServiceAlerts(!showServiceAlerts)}
          >
            <Ionicons name="warning" size={16} color="#FF9500" />
            <Text style={styles.alertsButtonText}>Alerts</Text>
            {showServiceAlerts ? (
              <Ionicons name="chevron-up" size={16} color="#8E8E93" />
            ) : (
              <Ionicons name="chevron-down" size={16} color="#8E8E93" />
            )}
          </TouchableOpacity>
        </View>
        
        {showServiceAlerts && (
          <View style={styles.collapsibleAlerts}>
            <ServiceAlerts affectedLines={lineIcons} embedded={true} />
          </View>
        )}
        <Text style={styles.loadingText}>Loading status...</Text>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="people" size={20} color="#FFFFFF" />
          <Text style={styles.title}>Live Station Status</Text>
          <TouchableOpacity 
            style={styles.alertsButton}
            onPress={() => setShowServiceAlerts(!showServiceAlerts)}
          >
            <Ionicons name="warning" size={16} color="#FF9500" />
            <Text style={styles.alertsButtonText}>Alerts</Text>
            {showServiceAlerts ? (
              <Ionicons name="chevron-up" size={16} color="#8E8E93" />
            ) : (
              <Ionicons name="chevron-down" size={16} color="#8E8E93" />
            )}
          </TouchableOpacity>
        </View>
        
        {showServiceAlerts && (
          <View style={styles.collapsibleAlerts}>
            <ServiceAlerts affectedLines={lineIcons} embedded={true} />
          </View>
        )}
        <Text style={styles.errorText}>Status unavailable</Text>
      </View>
    );
  }

  const lastUpdated = new Date(status.lastUpdated);
  const timeDiff = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={20} color="#FFFFFF" />
        <Text style={styles.title}>Live Station Status</Text>
        <TouchableOpacity 
          style={styles.alertsButton}
          onPress={() => setShowServiceAlerts(!showServiceAlerts)}
        >
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.alertsButtonText}>Service Alerts</Text>
          {showServiceAlerts ? (
            <Ionicons name="chevron-up" size={16} color="#8E8E93" />
          ) : (
            <Ionicons name="chevron-down" size={16} color="#8E8E93" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.updateTime}>
        {timeDiff < 1 ? 'Just updated' : `${timeDiff}m ago`}
      </Text>
      
      {showServiceAlerts && (
        <View style={styles.collapsibleAlerts}>
          <ServiceAlerts affectedLines={lineIcons} embedded={true} />
        </View>
      )}

      <View style={styles.statusGrid}>
        

        {/* ML Traffic Prediction */}
        {mlBusyness && mlBusyness.isMLData && mlBusyness.busynessLevel && (
          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <Ionicons name="analytics" size={24} color={mlBusyness.busynessLevel.color} />
            </View>
            <Text style={styles.statusLabel}>ML Busyness Prediction</Text>
            <Text style={[styles.statusValue, { color: mlBusyness.busynessLevel.color }]}>
              {mlBusyness.busynessLevel.category}
            </Text>
            <Text style={styles.statusSubtext}>
              {mlBusyness.busynessLevel.description}
            </Text>
            {mlBusyness.trafficPrediction && (
              <Text style={styles.statusSubtext}>
                Traffic: {mlBusyness.trafficPrediction.toFixed(0)}
              </Text>
            )}
          </View>
        )}
      </View>
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
  updateTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 16,
  },
  alertsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  alertsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  collapsibleAlerts: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: 8,
  },
  statusLabel: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusSubtext: {
    color: '#8E8E93',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  accessibilityAlert: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  accessibilityText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});