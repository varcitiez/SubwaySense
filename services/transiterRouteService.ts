import type { Line, Station } from '@/types/mta';

interface TransiterRoute {
  id: string;
  resource: {
    path: string;
    url: string;
  };
  system: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
  };
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  description: string;
  url: string;
  type: string;
  agency: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
  };
}

interface TransiterRouteResponse {
  routes: TransiterRoute[];
  nextId?: string;
}

interface TransiterStop {
  id: string;
  resource: {
    path: string;
    url: string;
  };
  system: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
  };
  name: string;
  latitude?: number;
  longitude?: number;
  type?: string;
}

interface TransiterStopResponse {
  stops: TransiterStop[];
  nextId?: string;
}

interface TransiterRouteDetail {
  id: string;
  resource: {
    path: string;
    url: string;
  };
  system: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
  };
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  description: string;
  type: string;
  agency: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
  };
  serviceMaps?: Array<{
    configId: string;
    stops: TransiterStop[];
  }>;
}

class TransiterRouteService {
  private baseUrl = 'https://demo.transiter.dev/systems/us-ny-subway';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  /**
   * Get all routes with their stations
   */
  async getAllRoutesWithStations(): Promise<Line[]> {
    try {
      console.log('🚇 Fetching all routes from Transiter...');
      
      // Get all routes
      const routesResponse = await this.fetchWithCache('/routes');
      if (!routesResponse?.routes) {
        throw new Error('No routes found');
      }

      const routes = routesResponse.routes;
      console.log(`✅ Found ${routes.length} routes`);

      // Get stations for each route
      const linesWithStations: Line[] = [];
      
      for (const route of routes) {
        try {
          console.log(`🔍 Processing route ${route.shortName} (${route.longName})...`);
          
          const routeDetail = await this.getRouteWithStations(route);
          if (routeDetail && routeDetail.stations.length > 0) {
            linesWithStations.push(routeDetail);
            console.log(`✅ Route ${route.shortName}: ${routeDetail.stations.length} stations`);
          } else {
            console.log(`⚠️ Route ${route.shortName}: No stations found`);
          }
        } catch (error) {
          console.error(`❌ Error processing route ${route.shortName}:`, error);
          // Continue with other routes
        }
      }

      console.log(`🎉 Successfully processed ${linesWithStations.length} routes with stations`);
      return linesWithStations;
    } catch (error) {
      console.error('❌ Error fetching routes with stations:', error);
      return [];
    }
  }

  /**
   * Get a single route with its stations
   */
  private async getRouteWithStations(route: TransiterRoute): Promise<Line | null> {
    try {
      // Get detailed route information including stops
      const routeDetail: TransiterRouteDetail = await this.fetchWithCache(`/routes/${route.id}`);
      
      if (!routeDetail) {
        return null;
      }

      // Extract stations from service maps
      const stations: Station[] = [];
      const stationIds = new Set<string>();

      if (routeDetail.serviceMaps) {
        // Use the first service map (usually 'alltimes' or 'weekday')
        const serviceMap = routeDetail.serviceMaps.find(sm => 
          sm.configId === 'alltimes' || 
          sm.configId === 'weekday' || 
          sm.configId === 'realtime'
        ) || routeDetail.serviceMaps[0];

        if (serviceMap && serviceMap.stops) {
          // Stops are directly in the array, no sorting needed for sequence
          for (const stop of serviceMap.stops) {
            // Avoid duplicates
            if (stationIds.has(stop.id)) continue;
            stationIds.add(stop.id);

            // Create station object (ML scores will be fetched when station is clicked)
            const station: Station = {
              id: stop.id,
              stationName: stop.name,
              busynessScore: this.generateBusynessScore(stop.name), // Fallback score
              crimeScore: this.generateCrimeScore(stop.name),
              overallScore: this.generateOverallScore(stop.name),
              metrics: this.generateMockMetrics(stop.name),
              coordinates: stop.latitude && stop.longitude ? {
                latitude: stop.latitude,
                longitude: stop.longitude
              } : undefined
            };

            stations.push(station);
          }
        }
      }

      // Create line object
      const line: Line = {
        lineName: `${route.longName} (${route.shortName})`,
        lineIcons: [route.shortName],
        lineColor: `#${route.color}`,
        aggregateSafety: this.generateAggregateSafety(stations),
        stations: stations
      };

      return line;
    } catch (error) {
      console.error(`❌ Error getting route ${route.id} with stations:`, error);
      return null;
    }
  }

  /**
   * Generate a mock busyness score for a station (will be replaced with ML)
   */
  private generateBusynessScore(stationName: string): number {
    // Simple hash-based scoring to make it consistent
    let hash = 0;
    for (let i = 0; i < stationName.length; i++) {
      const char = stationName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 4 + 6; // Score between 6-10
  }

  /**
   * Generate a mock crime score for a station (will be replaced with ML)
   */
  private generateCrimeScore(stationName: string): number {
    // Simple hash-based scoring to make it consistent
    let hash = 0;
    for (let i = 0; i < stationName.length; i++) {
      const char = stationName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use different seed for crime score
    hash = hash + 12345;
    return Math.abs(hash) % 4 + 6; // Score between 6-10
  }

  /**
   * Generate an overall safety score (will be calculated from other scores)
   */
  private generateOverallScore(stationName: string): number {
    // For now, simple hash-based scoring
    // Later this will be calculated from busyness and crime scores
    let hash = 0;
    for (let i = 0; i < stationName.length; i++) {
      const char = stationName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use different seed for overall score
    hash = hash + 54321;
    return Math.abs(hash) % 4 + 6; // Score between 6-10
  }

  /**
   * Generate mock metrics for a station
   */
  private generateMockMetrics(stationName: string): any {
    const scores = ['Good', 'Moderate', 'High', 'Very High'];
    const incidents = [0, 1, 2, 3, 4, 5];
    
    return {
      'Lighting Quality': scores[Math.abs(stationName.length) % scores.length],
      'Security Camera Coverage': scores[Math.abs(stationName.charCodeAt(0)) % scores.length],
      'Reported Incidents (30d)': incidents[Math.abs(stationName.length * 3) % incidents.length],
      'Passenger Traffic': scores[Math.abs(stationName.charCodeAt(1)) % scores.length]
    };
  }

  /**
   * Generate aggregate safety for a line
   */
  private generateAggregateSafety(stations: Station[]): string {
    if (stations.length === 0) return 'Unknown';
    
    const avgScore = stations.reduce((sum, station) => sum + station.overallScore, 0) / stations.length;
    
    if (avgScore >= 8.5) return 'Very High';
    if (avgScore >= 7.5) return 'High';
    if (avgScore >= 6.5) return 'Moderate';
    return 'Low';
  }

  /**
   * Fetch data with caching
   */
  private async fetchWithCache(endpoint: string): Promise<any> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`📦 Using cached data for ${endpoint}`);
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Transiter API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      console.log(`🌐 Fetched fresh data for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Transiter route cache cleared');
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/routes`);
      return response.ok;
    } catch (error) {
      console.error('❌ Transiter route connection test failed:', error);
      return false;
    }
  }
}

export const transiterRouteService = new TransiterRouteService();
