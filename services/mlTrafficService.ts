// ML Traffic Prediction Service
// Uses pre-calculated predictions to determine station busyness

interface MLPrediction {
  station: string;
  dotw: number; // Day of the week (Monday=0, Sunday=6)
  hour: number; // Hour of the day (0-23)
  month: number; // Month of the year (January=1, December=12)
  predicted_traffic: number;
}

interface BusynessLevel {
  category: 'Extremely Low' | 'Low' | 'Average' | 'High' | 'Extremely High';
  color: string;
  description: string;
}

class MLTrafficService {
  private predictions: MLPrediction[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  // Busyness thresholds based on ML model training data
  private readonly BUSYNESS_THRESHOLDS = {
    extremelyLow: 7,
    low: 21,
    average: 42,
    high: 77,
  };

  /**
   * Load predictions from the JSON file
   */
  private async loadPredictions(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadPredictionsInternal();
    await this.loadPromise;
  }

  private async _loadPredictionsInternal(): Promise<void> {
    try {
      console.log('📊 Loading ML traffic predictions...');
      
      // Import the predictions JSON file
      const predictionsModule = await import('@/assets/ml_traffic_predictions.json');
      this.predictions = predictionsModule.default || predictionsModule;
      
      this.isLoaded = true;
      console.log(`✅ Loaded ${this.predictions.length} ML traffic predictions`);
    } catch (error) {
      console.error('❌ Failed to load ML predictions:', error);
      this.predictions = [];
      this.isLoaded = true; // Mark as loaded to prevent retries
    }
  }

  /**
   * Get current traffic prediction for a station
   */
  async getCurrentTrafficPrediction(stationName: string): Promise<number | null> {
    await this.loadPredictions();
    
    if (this.predictions.length === 0) {
      console.log('⚠️ No ML predictions available');
      return null;
    }

    const now = new Date();
    const dotw = (now.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const hour = now.getHours();
    const month = now.getMonth() + 1; // Convert 0-11 to 1-12

    // Find matching prediction
    const prediction = this.predictions.find(p => 
      p.station === stationName &&
      p.dotw === dotw &&
      p.hour === hour &&
      p.month === month
    );

    if (prediction) {
      console.log(`📊 ML prediction for ${stationName}: ${prediction.predicted_traffic.toFixed(1)} traffic`);
      return prediction.predicted_traffic;
    } else {
      console.log(`⚠️ No ML prediction found for ${stationName} at ${dotw}/${hour}/${month}`);
      return null;
    }
  }

  /**
   * Get busyness category based on traffic prediction
   */
  getBusynessCategory(trafficPrediction: number): BusynessLevel {
    if (trafficPrediction < this.BUSYNESS_THRESHOLDS.extremelyLow) {
      return {
        category: 'Extremely Low',
        color: '#FF3B30', // Red
        description: 'Very quiet'
      };
    } else if (trafficPrediction < this.BUSYNESS_THRESHOLDS.low) {
      return {
        category: 'Low',
        color: '#FF9500', // Orange
        description: 'Light traffic'
      };
    } else if (trafficPrediction < this.BUSYNESS_THRESHOLDS.average) {
      return {
        category: 'Average',
        color: '#34C759', // Green
        description: 'Moderate traffic'
      };
    } else if (trafficPrediction < this.BUSYNESS_THRESHOLDS.high) {
      return {
        category: 'High',
        color: '#FFCC00', // Yellow
        description: 'Busy'
      };
    } else {
      return {
        category: 'Extremely High',
        color: '#FF9500', // Orange
        description: 'Very busy'
      };
    }
  }

  /**
   * Get current busyness for a station
   */
  async getCurrentBusyness(stationName: string): Promise<{
    trafficPrediction: number | null;
    busynessLevel: BusynessLevel | null;
    isMLData: boolean;
  }> {
    const trafficPrediction = await this.getCurrentTrafficPrediction(stationName);
    
    if (trafficPrediction === null) {
      return {
        trafficPrediction: null,
        busynessLevel: null,
        isMLData: false
      };
    }

    const busynessLevel = this.getBusynessCategory(trafficPrediction);
    
    return {
      trafficPrediction,
      busynessLevel,
      isMLData: true
    };
  }

  /**
   * Get busyness for multiple stations (batch processing)
   */
  async getBatchBusyness(stationNames: string[]): Promise<Map<string, {
    trafficPrediction: number | null;
    busynessLevel: BusynessLevel | null;
    isMLData: boolean;
  }>> {
    await this.loadPredictions();
    
    const results = new Map();
    const now = new Date();
    const dotw = (now.getDay() + 6) % 7;
    const hour = now.getHours();
    const month = now.getMonth() + 1;

    for (const stationName of stationNames) {
      const prediction = this.predictions.find(p => 
        p.station === stationName &&
        p.dotw === dotw &&
        p.hour === hour &&
        p.month === month
      );

      if (prediction) {
        const busynessLevel = this.getBusynessCategory(prediction.predicted_traffic);
        results.set(stationName, {
          trafficPrediction: prediction.predicted_traffic,
          busynessLevel,
          isMLData: true
        });
      } else {
        results.set(stationName, {
          trafficPrediction: null,
          busynessLevel: null,
          isMLData: false
        });
      }
    }

    console.log(`📊 Batch processed ${stationNames.length} stations, ${results.size} with ML data`);
    return results;
  }

  /**
   * Get prediction statistics for debugging
   */
  async getPredictionStats(): Promise<{
    totalPredictions: number;
    uniqueStations: number;
    isLoaded: boolean;
  }> {
    await this.loadPredictions();
    
    const uniqueStations = new Set(this.predictions.map(p => p.station)).size;
    
    return {
      totalPredictions: this.predictions.length,
      uniqueStations,
      isLoaded: this.isLoaded
    };
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.predictions = [];
    this.isLoaded = false;
    this.loadPromise = null;
    console.log('🗑️ ML predictions cache cleared');
  }
}

export const mlTrafficService = new MLTrafficService();
