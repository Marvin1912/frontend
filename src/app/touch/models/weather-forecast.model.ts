export interface WeatherForecast {
  date: string;
  iconCode: string;
  weatherId: number;
  description: string;
  temperatureC: number;
  humidityPct: number;
  windSpeedMs: number;
  latitude: number;
  longitude: number;
}

export interface HourlyWeatherForecast {
  dateTime: string;
  iconCode: string;
  weatherId: number;
  description: string;
  temperatureC: number;
  humidityPct: number;
  windSpeedMs: number;
  latitude: number;
  longitude: number;
}
