import type { TrainArrival } from '@/types/mta';

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
  childStops?: TransiterStop[];
  serviceMaps?: TransiterServiceMap[];
  alerts?: any[];
  stopTimes?: TransiterStopTime[];
  transfers?: TransiterTransfer[];
}

interface TransiterServiceMap {
  configId: string;
  routes: TransiterRoute[];
}

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
  color: string;
}

interface TransiterStopTime {
  stop: TransiterStop;
  trip: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
    route: TransiterRoute;
  };
  destination: TransiterStop;
  vehicle?: {
    id: string;
    resource: {
      path: string;
      url: string;
    };
  };
  arrival: {
    time: string;
    delay: number;
    uncertainty: number;
  };
  departure: {
    time: string;
    delay: number;
    uncertainty: number;
  };
  future: boolean;
  stopSequence: number;
  headsign: string;
  track?: string;
  directionId?: boolean;
}

interface TransiterTransfer {
  id: string;
  fromStop: TransiterStop;
  toStop: TransiterStop;
  type: string;
  minTransferTime?: number;
}

interface EnhancedStationData {
  id: string;
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  routes: string[];
  routeColors: { [routeId: string]: string };
  transfers: string[];
  platforms: string[];
  realTimeArrivals: TrainArrival[];
}

class TransiterStationService {
  private baseUrl = 'https://demo.transiter.dev/systems/us-ny-subway';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get enhanced station data from Transiter
   */
  async getStationData(stationId: string): Promise<EnhancedStationData | null> {
    try {
      console.log(`🔍 Fetching station data for ${stationId} from Transiter...`);
      
      const stopData = await this.fetchWithCache(`/stops/${stationId}`);
      
      if (!stopData) {
        console.log(`❌ No data found for station ${stationId}`);
        return null;
      }

      const enhancedData: EnhancedStationData = {
        id: stopData.id,
        name: stopData.name,
        coordinates: stopData.latitude && stopData.longitude ? {
          latitude: stopData.latitude,
          longitude: stopData.longitude
        } : undefined,
        routes: [],
        routeColors: {},
        transfers: [],
        platforms: [],
        realTimeArrivals: []
      };

      // Extract route information
      if (stopData.serviceMaps) {
        const allRoutes = new Set<string>();
        const routeColors: { [routeId: string]: string } = {};
        
        stopData.serviceMaps.forEach((serviceMap: TransiterServiceMap) => {
          serviceMap.routes.forEach((route: TransiterRoute) => {
            allRoutes.add(route.id);
            routeColors[route.id] = `#${route.color}`;
          });
        });
        
        enhancedData.routes = Array.from(allRoutes);
        enhancedData.routeColors = routeColors;
      }

      // Extract platform information
      if (stopData.childStops) {
        enhancedData.platforms = stopData.childStops.map((child: TransiterStop) => child.id);
      }

      // Extract transfer information
      if (stopData.transfers) {
        enhancedData.transfers = stopData.transfers.map((transfer: TransiterTransfer) => transfer.toStop.name);
      }

      // Extract real-time arrivals
      if (stopData.stopTimes && stopData.stopTimes.length > 0) {
        enhancedData.realTimeArrivals = this.parseStopTimes(stopData.stopTimes);
      }

      console.log(`✅ Enhanced station data for ${stationId}:`, {
        routes: enhancedData.routes,
        platforms: enhancedData.platforms.length,
        transfers: enhancedData.transfers.length,
        arrivals: enhancedData.realTimeArrivals.length
      });

      return enhancedData;
    } catch (error) {
      console.error(`❌ Error fetching station data for ${stationId}:`, error);
      return null;
    }
  }

  /**
   * Parse stop times into TrainArrival format
   */
  private parseStopTimes(stopTimes: TransiterStopTime[]): TrainArrival[] {
    const now = Date.now();
    
    return stopTimes
      .filter(stopTime => stopTime.future) // Only future arrivals
      .map(stopTime => {
        const arrivalTime = parseInt(stopTime.arrival.time) * 1000;
        const minutesAway = Math.max(0, Math.round((arrivalTime - now) / (1000 * 60)));
        
        return {
          trainId: stopTime.trip.id,
          line: stopTime.trip.route.id,
          direction: (stopTime.directionId ? 'N' : 'S') as 'N' | 'S' | 'E' | 'W',
          minutesAway,
          destination: stopTime.destination.name,
          isDelayed: stopTime.arrival.delay > 0
        };
      })
      .sort((a, b) => a.minutesAway - b.minutesAway)
      .slice(0, 10); // Limit to next 10 arrivals
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
   * Test connection to Transiter
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/stops/L03`);
      return response.ok;
    } catch (error) {
      console.error('❌ Transiter connection test failed:', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Transiter cache cleared');
  }
}

export const transiterStationService = new TransiterStationService();
