import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, CircleProps } from 'react-native-svg';

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  mapWidth: number;
  mapHeight: number;
  zoomLevel: number;
}

// NYC Subway Map bounds (approximate)
const MAP_BOUNDS = {
  north: 40.9176, // Northernmost point
  south: 40.4774, // Southernmost point  
  west: -74.2591, // Westernmost point
  east: -73.7004, // Easternmost point
};

export function LocationMarker({ 
  latitude, 
  longitude, 
  accuracy, 
  mapWidth, 
  mapHeight, 
  zoomLevel 
}: LocationMarkerProps) {
  // Convert lat/lng to pixel coordinates on the map
  const getMapPosition = (lat: number, lng: number) => {
    const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * mapWidth;
    const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * mapHeight;
    return { x, y };
  };

  const position = getMapPosition(latitude, longitude);
  
  // Calculate accuracy circle radius in pixels
  const accuracyRadius = accuracy ? (accuracy / 111000) * mapWidth : 0; // Rough conversion from meters to pixels

  return (
    <View 
      style={[
        styles.markerContainer,
        {
          left: position.x - 12, // Center the marker (24px width / 2)
          top: position.y - 12,  // Center the marker (24px height / 2)
          transform: [{ scale: zoomLevel }],
        }
      ]}
    >
      {/* Accuracy circle */}
      {accuracy && accuracyRadius > 0 && (
        <View
          style={[
            styles.accuracyCircle,
            {
              width: accuracyRadius * 2,
              height: accuracyRadius * 2,
              borderRadius: accuracyRadius,
              left: 12 - accuracyRadius,
              top: 12 - accuracyRadius,
            }
          ]}
        />
      )}
      
      {/* Location marker */}
      <View style={styles.marker}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Circle
            cx="12"
            cy="12"
            r="8"
            fill="#007AFF"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Circle
            cx="12"
            cy="12"
            r="3"
            fill="#FFFFFF"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: 24,
    height: 24,
  },
  accuracyCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.4)',
  },
  marker: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
