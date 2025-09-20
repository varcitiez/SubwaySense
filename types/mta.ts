export interface Metrics {
  "Lighting Quality": string;
  "Security Camera Coverage": string;
  "Reported Incidents (30d)": number;
  "Passenger Traffic": string;
}

export interface TrainArrival {
  trainId: string;
  line: string;
  direction: 'N' | 'S' | 'E' | 'W';
  minutesAway: number;
  destination: string;
  isDelayed: boolean;
}

export interface ServiceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedLines: string[];
  startTime: string;
  endTime?: string;
  isActive: boolean;
}

export interface LiveStationStatus {
  stationId: string;
  crowdingLevel: 'low' | 'moderate' | 'high' | 'very-high';
  temperature: number;
  elevatorStatus: 'working' | 'out-of-service';
  escalatorStatus: 'working' | 'out-of-service';
  lastUpdated: string;
}

export interface Station {
  stationName: string;
  id: string;
  overallScore: number;
  metrics: Metrics;
  arrivals?: TrainArrival[];
  liveStatus?: LiveStationStatus;
}

export interface Line {
  lineName: string;
  lineIcons: string[];
  lineColor: string;
  aggregateSafety: string;
  stations: Station[];
  serviceAlerts?: ServiceAlert[];
}

export interface MTAData {
  lines: Line[];
  globalAlerts?: ServiceAlert[];
  lastUpdated?: string;
}