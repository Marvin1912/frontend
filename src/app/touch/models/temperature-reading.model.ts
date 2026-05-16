export interface TemperatureReading {
  sensorId: string;
  label: string;
  location: 'indoor' | 'outdoor';
  temperatureC: number;
  measuredAt: string;
}
