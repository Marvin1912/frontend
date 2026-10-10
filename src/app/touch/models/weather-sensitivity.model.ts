export type WeatherSensitivityLevel = 'KEINE' | 'GERING' | 'MITTEL' | 'HOCH';

export type WeatherSensitivityTrend = 'RISING' | 'STABLE' | 'FALLING';

// Unavailable values are null or omitted by the backend.
export interface WeatherSensitivityMetrics {
  dewPointOutside?: number | null;
  absoluteHumidityOutside?: number | null;
  heatIndexOutside?: number | null;
  deltaT3h?: number | null;
  deltaT24h?: number | null;
  deltaDewPoint3h?: number | null;
  deltaPressure3h?: number | null;
  forecastDeltaT?: number | null;
  forecastDeltaPressure?: number | null;
}

export interface WeatherSensitivity {
  level: WeatherSensitivityLevel;
  trend: WeatherSensitivityTrend;
  reasons: string[];
  metrics: WeatherSensitivityMetrics;
}
