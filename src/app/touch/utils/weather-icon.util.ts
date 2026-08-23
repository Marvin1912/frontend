export function weatherIconFor(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 600) return 'water_drop';
  if (weatherId >= 600 && weatherId < 700) return 'ac_unit';
  if (weatherId >= 700 && weatherId < 800) return 'foggy';
  if (weatherId === 800) return 'wb_sunny';
  return 'cloud';
}
