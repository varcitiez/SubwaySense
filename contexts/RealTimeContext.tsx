import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { mtaRealTimeService } from '@/services/mtaRealTimeService';
import type { ServiceAlert, TrainArrival, LiveStationStatus } from '@/types/mta';

interface RealTimeState {
  serviceAlerts: ServiceAlert[];
  isOnline: boolean;
  lastUpdated: string | null;
  systemStatus: { isOperational: boolean; lastUpdated: string } | null;
}

interface RealTimeActions {
  getStationArrivals: (stationId: string) => Promise<TrainArrival[]>;
  getStationStatus: (stationId: string) => Promise<LiveStationStatus | null>;
  refreshData: () => void;
  isLoading: boolean;
}

export const [RealTimeProvider, useRealTime] = createContextHook(() => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const serviceAlertsQuery = useQuery({
    queryKey: ['serviceAlerts'],
    queryFn: mtaRealTimeService.getServiceAlerts,
    refetchInterval: 30000,
    staleTime: 25000,
    gcTime: 5 * 60 * 1000,
  });

  const systemStatusQuery = useQuery({
    queryKey: ['systemStatus'],
    queryFn: mtaRealTimeService.getSystemStatus,
    refetchInterval: 60000,
    staleTime: 55000,
  });

  useEffect(() => {
    if (serviceAlertsQuery.data) {
      AsyncStorage.setItem('cachedServiceAlerts', JSON.stringify(serviceAlertsQuery.data))
        .catch((error: unknown) => {
          if (error instanceof Error) {
            console.error('Failed to cache service alerts:', error.message);
          }
        });
      setLastUpdated(new Date().toISOString());
    }
  }, [serviceAlertsQuery.data]);

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await AsyncStorage.getItem('cachedServiceAlerts');
        if (cached && !serviceAlertsQuery.data) {
          console.log('Using cached service alerts');
        }
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    };
    
    loadCachedData();
  }, [serviceAlertsQuery.data]);

  useEffect(() => {
    const checkNetworkStatus = () => {
      setIsOnline(!serviceAlertsQuery.isError && !systemStatusQuery.isError);
    };
    
    checkNetworkStatus();
  }, [serviceAlertsQuery.isError, systemStatusQuery.isError]);

  const getStationArrivals = useCallback(async (stationId: string): Promise<TrainArrival[]> => {
    try {
      console.log(`Fetching arrivals for station: ${stationId}`);
      const arrivals = await mtaRealTimeService.getTrainArrivals(stationId);
      
      await AsyncStorage.setItem(`arrivals_${stationId}`, JSON.stringify({
        data: arrivals,
        timestamp: new Date().toISOString()
      }));
      
      return arrivals;
    } catch (error) {
      console.error('Failed to fetch station arrivals:', error);
      
      try {
        const cached = await AsyncStorage.getItem(`arrivals_${stationId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(timestamp).getTime();
          
          if (cacheAge < 5 * 60 * 1000) {
            console.log('Using cached arrivals data');
            return data;
          }
        }
      } catch (cacheError) {
        console.error('Failed to load cached arrivals:', cacheError);
      }
      
      return [];
    }
  }, []);

  const getStationStatus = useCallback(async (stationId: string): Promise<LiveStationStatus | null> => {
    try {
      console.log(`Fetching status for station: ${stationId}`);
      const status = await mtaRealTimeService.getLiveStationStatus(stationId);
      
      if (status) {
        await AsyncStorage.setItem(`status_${stationId}`, JSON.stringify({
          data: status,
          timestamp: new Date().toISOString()
        }));
      }
      
      return status;
    } catch (error) {
      console.error('Failed to fetch station status:', error);
      
      try {
        const cached = await AsyncStorage.getItem(`status_${stationId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(timestamp).getTime();
          
          if (cacheAge < 10 * 60 * 1000) {
            console.log('Using cached status data');
            return data;
          }
        }
      } catch (cacheError) {
        console.error('Failed to load cached status:', cacheError);
      }
      
      return null;
    }
  }, []);

  const refreshData = useCallback(() => {
    console.log('Refreshing real-time data...');
    serviceAlertsQuery.refetch();
    systemStatusQuery.refetch();
    setLastUpdated(new Date().toISOString());
  }, [serviceAlertsQuery, systemStatusQuery]);

  const state: RealTimeState = {
    serviceAlerts: serviceAlertsQuery.data || [],
    isOnline,
    lastUpdated,
    systemStatus: systemStatusQuery.data || null,
  };

  const actions: RealTimeActions = {
    getStationArrivals,
    getStationStatus,
    refreshData,
    isLoading: serviceAlertsQuery.isLoading || systemStatusQuery.isLoading,
  };

  return { ...state, ...actions };
});