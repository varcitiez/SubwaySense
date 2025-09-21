import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTime } from '@/contexts/RealTimeContext';
import { flaskSafetyService } from '@/services/flaskSafetyService';
import type { ServiceAlert } from '@/types/mta';

interface SafetyAlertsProps {
  stationId?: string;
  lineIcons?: string[];
  stationName?: string;
}

export function SafetyAlertsComponent({ stationId, lineIcons, stationName }: SafetyAlertsProps) {
  const { serviceAlerts, isLoading } = useRealTime();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [flaskAlerts, setFlaskAlerts] = useState<ServiceAlert[]>([]);
  const [flaskLoading, setFlaskLoading] = useState<boolean>(false);
  const [flaskError, setFlaskError] = useState<string | null>(null);

  // Fetch Flask safety alerts when station name changes
  useEffect(() => {
    const fetchFlaskAlerts = async () => {
      if (!stationName) return;

      setFlaskLoading(true);
      setFlaskError(null);
      
      try {
        const alerts = await flaskSafetyService.getSafetyAlerts(stationName);
        setFlaskAlerts(alerts);
        console.log(`🚨 Flask returned ${alerts.length} safety alerts for ${stationName}`);
      } catch (error) {
        console.error('❌ Failed to fetch Flask safety alerts:', error);
        setFlaskError('Failed to load safety alerts from server');
        setFlaskAlerts([]);
      } finally {
        setFlaskLoading(false);
      }
    };

    fetchFlaskAlerts();
  }, [stationName]);

  // Combine Flask alerts with regular service alerts
  const allAlerts = [...flaskAlerts, ...serviceAlerts];

  // Filter alerts based on station or line relevance
  const relevantAlerts = allAlerts.filter(alert => {
    // Flask alerts are always relevant (they're station-specific)
    if (alert.id.startsWith('flask-')) return true;
    
    // If no specific station/line filtering, show all alerts
    if (!stationId && !lineIcons) return true;
    
    // Check if alert affects any of the station's lines
    if (lineIcons && lineIcons.length > 0) {
      return alert.affectedLines.some(line => lineIcons.includes(line));
    }
    
    return true;
  });

  const getSeverityColor = (severity: ServiceAlert['severity']): string => {
    switch (severity) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getSeverityIcon = (severity: ServiceAlert['severity']): keyof typeof Ionicons.glyphMap => {
    switch (severity) {
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getSeverityText = (severity: ServiceAlert['severity']): string => {
    switch (severity) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  const formatTimeAgo = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading || flaskLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.title}>Safety Alerts</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Loading...</Text>
          </View>
        </View>
        <Text style={styles.loadingText}>
          {flaskLoading ? 'Fetching safety data from server...' : 'Loading safety information...'}
        </Text>
      </View>
    );
  }

  const activeAlerts = relevantAlerts.filter(alert => alert.isActive);
  const highPriorityAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
        <Text style={styles.title}>Safety Alerts</Text>
        <TouchableOpacity 
          style={styles.badge}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.badgeText}>
            {activeAlerts.length} Alert{activeAlerts.length !== 1 ? 's' : ''}
          </Text>
          {showDetails ? (
            <Ionicons name="chevron-up" size={16} color="#8E8E93" />
          ) : (
            <Ionicons name="chevron-down" size={16} color="#8E8E93" />
          )}
        </TouchableOpacity>
      </View>

      {flaskError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {flaskError}</Text>
          <Text style={styles.errorSubtext}>Showing cached data only</Text>
        </View>
      )}

      {activeAlerts.length === 0 ? (
        <View style={styles.noAlertsContainer}>
          <Ionicons name="checkmark-circle" size={32} color="#34C759" />
          <Text style={styles.noAlertsText}>All Clear</Text>
          <Text style={styles.noAlertsSubtext}>No safety alerts at this time</Text>
        </View>
      ) : (
        <>
          {highPriorityAlerts.length > 0 && (
            <View style={styles.priorityAlert}>
              <Ionicons name="warning" size={20} color="#FF3B30" />
              <Text style={styles.priorityAlertText}>
                {highPriorityAlerts.length} High Priority Alert{highPriorityAlerts.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {showDetails && (
            <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
              {activeAlerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertIconContainer}>
                      <Ionicons 
                        name={getSeverityIcon(alert.severity)} 
                        size={16} 
                        color={getSeverityColor(alert.severity)} 
                      />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertTime}>{formatTimeAgo(alert.startTime)}</Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                      <Text style={styles.severityText}>
                        {getSeverityText(alert.severity).split(' ')[0]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  {alert.affectedLines.length > 0 && (
                    <View style={styles.affectedLines}>
                      <Text style={styles.affectedLinesLabel}>Affected Lines:</Text>
                      <View style={styles.lineTags}>
                        {alert.affectedLines.map((line) => (
                          <View key={line} style={styles.lineTag}>
                            <Text style={styles.lineTagText}>{line}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noAlertsText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  noAlertsSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  priorityAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  priorityAlertText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  alertsList: {
    maxHeight: 300,
  },
  alertItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  alertTime: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  alertDescription: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  affectedLines: {
    marginTop: 8,
  },
  affectedLinesLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  lineTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  lineTag: {
    backgroundColor: '#3A3A3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lineTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});
