import type { TrainArrival, ServiceAlert, LiveStationStatus } from '@/types/mta';

class MTARealTimeService {
  private baseUrl = 'https://api.mta.info/mta-gtfs-realtime';
  
  async getTrainArrivals(stationId: string): Promise<TrainArrival[]> {
    try {
      // Simulate real-time data for demo purposes
      // In production, this would call the actual MTA API
      const mockArrivals: TrainArrival[] = [
        {
          trainId: '4-1234',
          line: '4',
          direction: 'N',
          minutesAway: Math.floor(Math.random() * 15) + 1,
          destination: 'Woodlawn - 161 St',
          isDelayed: Math.random() > 0.8
        },
        {
          trainId: '5-5678',
          line: '5',
          direction: 'N',
          minutesAway: Math.floor(Math.random() * 20) + 3,
          destination: 'Eastchester - Dyre Ave',
          isDelayed: Math.random() > 0.9
        },
        {
          trainId: '6-9012',
          line: '6',
          direction: 'S',
          minutesAway: Math.floor(Math.random() * 12) + 2,
          destination: 'Brooklyn Bridge - City Hall',
          isDelayed: false
        }
      ];
      
      return mockArrivals.sort((a, b) => a.minutesAway - b.minutesAway);
    } catch (error) {
      console.error('Error fetching train arrivals:', error);
      return [];
    }
  }

  async getServiceAlerts(): Promise<ServiceAlert[]> {
    try {
      // Simulate service alerts
      const mockAlerts: ServiceAlert[] = [
        {
          id: 'alert-001',
          title: 'Service Change',
          description: '4/5/6 trains running with delays due to signal problems at 59 St',
          severity: 'medium',
          affectedLines: ['4', '5', '6'],
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isActive: true
        },
        {
          id: 'alert-002',
          title: 'Weekend Service',
          description: 'L train not running between 8 Ave and Bedford Ave, shuttle buses provided',
          severity: 'high',
          affectedLines: ['L'],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        }
      ];
      
      return mockAlerts.filter(alert => alert.isActive);
    } catch (error) {
      console.error('Error fetching service alerts:', error);
      return [];
    }
  }

  async getLiveStationStatus(stationId: string): Promise<LiveStationStatus | null> {
    try {
      // Simulate live station status
      const crowdingLevels: LiveStationStatus['crowdingLevel'][] = ['low', 'moderate', 'high', 'very-high'];
      const statuses: ('working' | 'out-of-service')[] = ['working', 'out-of-service'];
      
      const mockStatus: LiveStationStatus = {
        stationId,
        crowdingLevel: crowdingLevels[Math.floor(Math.random() * crowdingLevels.length)],
        temperature: Math.floor(Math.random() * 15) + 65, // 65-80°F
        elevatorStatus: Math.random() > 0.1 ? 'working' : 'out-of-service',
        escalatorStatus: Math.random() > 0.15 ? 'working' : 'out-of-service',
        lastUpdated: new Date().toISOString()
      };
      
      return mockStatus;
    } catch (error) {
      console.error('Error fetching live station status:', error);
      return null;
    }
  }

  async getSystemStatus(): Promise<{ isOperational: boolean; lastUpdated: string }> {
    try {
      return {
        isOperational: Math.random() > 0.05, // 95% uptime simulation
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching system status:', error);
      return {
        isOperational: false,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

export const mtaRealTimeService = new MTARealTimeService();