import {TemperatureReading} from '../models/temperature-reading.model';

export type VentilationAdvice = 'ventilate' | 'keep-closed' | 'unknown';

/** Relative humidity (%) at which a room starts to warn. */
export const HUMIDITY_ON_PCT = 65;
/** Relative humidity (%) below which the warning clears again. */
export const HUMIDITY_OFF_PCT = 60;
/** Outside air must be at least this much drier (g/m³) for ventilating to help. */
export const MIN_ABSOLUTE_DIFF_G_M3 = 1;

/** Absolute humidity in g/m³ (Magnus formula). */
export function absoluteHumidity(temperatureC: number, humidityPct: number): number {
  const saturationHpa = 6.112 * Math.exp((17.62 * temperatureC) / (243.12 + temperatureC));
  const vapourHpa = saturationHpa * humidityPct / 100;
  return 216.7 * vapourHpa / (273.15 + temperatureC);
}

/**
 * Returns the advice for every humid indoor room, keyed by sensorId. Rooms not in the map are fine.
 * `previous` is the last result, used for hysteresis between HUMIDITY_OFF_PCT and HUMIDITY_ON_PCT.
 */
export function ventilationAdvice(readings: TemperatureReading[],
                                  previous: ReadonlyMap<string, VentilationAdvice>): Map<string, VentilationAdvice> {
  const outdoor = readings.find(r => r.location === 'outdoor' && r.humidityPct != null);
  const outdoorAbs = outdoor ? absoluteHumidity(outdoor.temperatureC, outdoor.humidityPct!) : null;
  const advice = new Map<string, VentilationAdvice>();

  for (const r of readings) {
    if (r.location !== 'indoor' || r.humidityPct == null) continue;
    const threshold = previous.has(r.sensorId) ? HUMIDITY_OFF_PCT : HUMIDITY_ON_PCT;
    if (r.humidityPct < threshold) continue;
    if (outdoorAbs === null) {
      advice.set(r.sensorId, 'unknown');
      continue;
    }
    const indoorAbs = absoluteHumidity(r.temperatureC, r.humidityPct);
    advice.set(r.sensorId, indoorAbs - outdoorAbs >= MIN_ABSOLUTE_DIFF_G_M3 ? 'ventilate' : 'keep-closed');
  }
  return advice;
}
