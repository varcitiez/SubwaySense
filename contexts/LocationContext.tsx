import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface LocationContextType {
  location: LocationState | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestLocation: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    console.log('Requesting location permission...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      const hasPermission = status === 'granted';
      setHasPermission(hasPermission);
      
      if (!hasPermission) {
        setError('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show your position on the subway map. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
      
      return hasPermission;
    } catch (err) {
      console.error('Permission request error:', err);
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    console.log('Getting current location...');
    if (!hasPermission) {
      console.log('No permission, requesting...');
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) return;
    }

    console.log('Setting loading state...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting location from device...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000
      });

      console.log('Location received:', currentLocation);

      const locationData: LocationState = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      };

      console.log('Setting location data:', locationData);
      setLocation(locationData);
    } catch (err) {
      console.error('Location error:', err);
      setError('Failed to get current location');
    } finally {
      console.log('Location request completed');
      setIsLoading(false);
    }
  }, [hasPermission, requestLocationPermission]);

  const requestLocation = useCallback(async () => {
    await requestLocationPermission();
    await getCurrentLocation();
  }, [requestLocationPermission, getCurrentLocation]);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      console.log('Checking initial location permission...');
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        console.log('Initial permission status:', status);
        setHasPermission(status === 'granted');
      } catch (err) {
        console.error('Failed to check location permission:', err);
      }
    };

    checkPermission();
  }, []);

  const value: LocationContextType = {
    location,
    isLoading,
    error,
    hasPermission,
    requestLocation,
    getCurrentLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
