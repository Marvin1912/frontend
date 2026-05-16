export interface TemperatureReading {
  sensorId: string;
  label: string;
  location: 'indoor' | 'outdoor';
  temperatureC: number;
  humidityPct?: number;
  measuredAt: string;
}
