import type { ServiceAlert } from '@/types/mta';

interface FlaskIncident {
  description: string;
  time: string;
  station: string;
}

interface FlaskResponse {
  response: FlaskIncident[];
  sources?: string[];
  [key: string]: any;
}

class FlaskSafetyService {
  private baseUrl = 'http://localhost:4500';

  /**
   * Fetch safety alerts from the Flask server for a specific station
   */
  async getSafetyAlerts(stationName: string): Promise<ServiceAlert[]> {
    try {
      console.log(`🔍 Fetching safety alerts for station: ${stationName}`);
      
      const response = await fetch(`${this.baseUrl}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station: stationName
        })
      });

      if (!response.ok) {
        throw new Error(`Flask server error: ${response.status} ${response.statusText}`);
      }

      const data: FlaskResponse = await response.json();
      console.log(`✅ Flask server returned ${data.response?.length || 0} incidents`);

      // Convert Flask incidents to ServiceAlert format
      const alerts: ServiceAlert[] = data.response?.map((incident, index) => ({
        id: `flask-${stationName}-${index}`,
        title: 'Safety Incident Report',
        description: `${incident.description} at ${incident.station} (${incident.time})`,
        severity: this.determineSeverity(incident.description),
        affectedLines: [], // Flask doesn't provide line information
        startTime: new Date().toISOString(),
        isActive: true
      })) || [];

      return alerts;
    } catch (error) {
      console.error('❌ Error fetching safety alerts from Flask:', error);
      return [];
    }
  }

  /**
   * Determine severity based on incident description
   */
  private determineSeverity(description: string): 'low' | 'medium' | 'high' {
    const desc = description.toLowerCase();
    
    if (desc.includes('assault') || desc.includes('robbery') || desc.includes('violent') || desc.includes('weapon')) {
      return 'high';
    }
    
    if (desc.includes('theft') || desc.includes('harassment') || desc.includes('disturbance')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Test connection to Flask server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station: 'Test Station'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Flask server connection test failed:', error);
      return false;
    }
  }
}

export const flaskSafetyService = new FlaskSafetyService();
