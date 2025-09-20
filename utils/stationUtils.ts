// NYC Subway Station Coordinates (approximate)
export const STATION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
    // Lexington Avenue Line (4, 5, 6)
    "R20": { latitude: 40.807604, longitude: -73.945598 }, // 125 St (Lexington Ave)
    "R19": { latitude: 40.779527, longitude: -73.955482 }, // 86 St (Lexington Ave)
    "R18": { latitude: 40.762391, longitude: -73.967547 }, // 59 St – Lexington Ave
    "R17": { latitude: 40.752726, longitude: -73.977229 }, // Grand Central – 42 St
  
    // Broadway Line (N, Q, R, W)
    "R16": { latitude: 40.757500, longitude: -73.985830 }, // Times Square – 42 St (complex centroid)
    "R15": { latitude: 40.749567, longitude: -73.987950 }, // Herald Square – 34 St (complex centroid)
    "R14": { latitude: 40.734720, longitude: -73.990280 }, // Union Square – 14 St (complex centroid)
  
    // 8th Avenue Line (A, C, E)
    "R13": { latitude: 40.757200, longitude: -73.989800 }, // 42 St – Port Authority Bus Terminal (42 St / 8th Ave)
    "R12": { latitude: 40.740824, longitude: -74.002138 }, // 14 St – 8 Ave (14th St / 8th Ave complex)
    "R11": { latitude: 40.733253, longitude: -73.999824 }, // W 4 St – Washington Sq (West 4th St / Washington Sq area)
  
    // 7th Avenue Line (1, 2, 3)
    "R10": { latitude: 40.737199, longitude: -73.996692 }, // 14 St – 7 Ave (1/2/3 / 14th St & 7th Ave)
    "R9":  { latitude: 40.757500, longitude: -73.985830 }, // 42 St – Times Sq (duplicate complex — Times Sq centroid)
    "R8":  { latitude: 40.737199, longitude: -73.996692 }, // 14 St – 7 Ave (duplicate)
  
    // 6th Avenue Line (B, D, F, M)
    "R7":  { latitude: 40.734720, longitude: -73.990280 }, // 14 St – 6 Ave (14th St / 6th Ave area; UnionSq complex nearby)
    "R6":  { latitude: 40.753742, longitude: -73.983559 }, // 42 St – Bryant Park / 5 Ave (Bryant Park / 42nd St area)
    "R5":  { latitude: 40.734720, longitude: -73.990280 }, // 14 St – 6 Ave (duplicate / same 14th St corridor)
  
    // Broadway - 7th Avenue Line (1, 2, 3)
    "R4":  { latitude: 40.737199, longitude: -73.996692 }, // 14 St – 7 Ave (repeat)
    "R3":  { latitude: 40.757500, longitude: -73.985830 }, // 42 St – Times Sq (repeat)
    "R2":  { latitude: 40.737199, longitude: -73.996692 }, // 14 St – 7 Ave (repeat)
    "R1":  { latitude: 40.737199, longitude: -73.996692 }, // 14 St – 7 Ave (repeat)
  };
  

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Find the closest station to given coordinates
export function findClosestStation(
  userLat: number, 
  userLon: number, 
  stations: Array<{ id: string; stationName: string }>
): { station: { id: string; stationName: string }; distance: number } | null {
  let closestStation = null;
  let minDistance = Infinity;
  
  stations.forEach(station => {
    const coords = STATION_COORDINATES[station.id];
    if (coords) {
      const distance = calculateDistance(userLat, userLon, coords.latitude, coords.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        closestStation = station;
      }
    }
  });
  
  return closestStation ? { station: closestStation, distance: minDistance } : null;
}
