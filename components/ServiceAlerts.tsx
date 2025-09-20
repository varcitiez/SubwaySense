import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTime } from '@/contexts/RealTimeContext';
import type { ServiceAlert } from '@/types/mta';

interface ServiceAlertsProps {
  affectedLines?: string[];
  embedded?: boolean;
}

export function ServiceAlerts({ affectedLines, embedded = false }: ServiceAlertsProps) {
  const { serviceAlerts } = useRealTime();

  const filteredAlerts = affectedLines 
    ? serviceAlerts.filter(alert => 
        alert.affectedLines.some(line => affectedLines.includes(line))
      )
    : serviceAlerts;

  const getSeverityIcon = (severity: ServiceAlert['severity']) => {
    const iconProps = { size: 16 };
    
    switch (severity) {
      case 'high':
        return <Ionicons name="warning" {...iconProps} color="#FF3B30" />;
      case 'medium':
        return <Ionicons name="alert-circle" {...iconProps} color="#FF9500" />;
      case 'low':
        return <Ionicons name="information-circle" {...iconProps} color="#007AFF" />;
      default:
        return <Ionicons name="information-circle" {...iconProps} color="#8E8E93" />;
    }
  };

  const getSeverityColor = (severity: ServiceAlert['severity']): string => {
    switch (severity) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (filteredAlerts.length === 0) {
    return (
      <View style={[styles.container, embedded && styles.embeddedContainer]}>
        <View style={styles.header}>
          <Ionicons name="information-circle" size={20} color="#34C759" />
          <Text style={styles.title}>Service Status</Text>
        </View>
        <View style={styles.noAlertsContainer}>
          <Text style={styles.noAlertsText}>Good Service</Text>
          <Text style={styles.noAlertsSubtext}>No active service alerts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, embedded && styles.embeddedContainer]}>
      <View style={styles.header}>
        <Ionicons name="warning" size={20} color="#FF9500" />
        <Text style={styles.title}>Service Alerts</Text>
        <View style={styles.alertCount}>
          <Text style={styles.alertCountText}>{filteredAlerts.length}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
        {filteredAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleRow}>
                {getSeverityIcon(alert.severity)}
                <Text style={styles.alertTitle}>{alert.title}</Text>
              </View>
              <Text style={styles.alertTime}>{formatTime(alert.startTime)}</Text>
            </View>
            
            <Text style={styles.alertDescription}>{alert.description}</Text>
            
            <View style={styles.affectedLinesContainer}>
              <Text style={styles.affectedLinesLabel}>Affected lines:</Text>
              <View style={styles.affectedLines}>
                {alert.affectedLines.map((line) => (
                  <View key={line} style={styles.affectedLineBadge}>
                    <Text style={styles.affectedLineText}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {alert.endTime && (
              <Text style={styles.endTime}>
                Expected to end: {new Date(alert.endTime).toLocaleString()}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  alertCount: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  alertCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAlertsText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  noAlertsSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  alertsList: {
    maxHeight: 300,
  },
  alertItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  alertHeader: {
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  alertTime: {
    color: '#8E8E93',
    fontSize: 12,
  },
  alertDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  affectedLinesContainer: {
    marginBottom: 8,
  },
  affectedLinesLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 6,
  },
  affectedLines: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  affectedLineBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  affectedLineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  endTime: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
  },
  embeddedContainer: {
    marginHorizontal: 0,
    marginTop: 0,
  },
});