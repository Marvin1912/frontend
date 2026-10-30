import {TemperatureReading} from '../models/temperature-reading.model';

export type VentilationAdvice = 'ventilate' | 'keep-closed' | 'unknown';

export interface VentilationState {
  advice: VentilationAdvice;
  /** Relative humidity (%) worth aiming for, or null when ventilating would not help. */
  targetPct: number | null;
}

/** Relative humidity (%) at which a room starts to warn. */
export const HUMIDITY_ON_PCT = 65;
/** Relative humidity (%) below which the warning clears again. */
export const HUMIDITY_OFF_PCT = 60;
/** Middle of the 40–60 % comfort range. */
export const OPTIMAL_HUMIDITY_PCT = 50;
/** Outside air must be at least this much drier (g/m³) for ventilating to help. */
export const MIN_ABSOLUTE_DIFF_G_M3 = 1;

/** Absolute humidity in g/m³ (Magnus formula). */
export function absoluteHumidity(temperatureC: number, humidityPct: number): number {
  const saturationHpa = 6.112 * Math.exp((17.62 * temperatureC) / (243.12 + temperatureC));
  const vapourHpa = saturationHpa * humidityPct / 100;
  return 216.7 * vapourHpa / (273.15 + temperatureC);
}

/** Relative humidity (%) the outside air would have once warmed to the room temperature. */
export function reachableHumidity(roomTemperatureC: number, outdoorAbsolute: number): number {
  return outdoorAbsolute / absoluteHumidity(roomTemperatureC, 100) * 100;
}

/**
 * Returns the state of every humid indoor room, keyed by sensorId. Rooms not in the map are fine.
 * `previous` is the last result, used for hysteresis between HUMIDITY_OFF_PCT and HUMIDITY_ON_PCT.
 * The target is the comfort optimum, or what fully exchanged air can reach if that is higher.
 */
export function ventilationAdvice(readings: TemperatureReading[],
                                  previous: ReadonlyMap<string, VentilationState>): Map<string, VentilationState> {
  const outdoor = readings.find(r => r.location === 'outdoor' && r.humidityPct != null);
  const outdoorAbs = outdoor ? absoluteHumidity(outdoor.temperatureC, outdoor.humidityPct!) : null;
  const states = new Map<string, VentilationState>();

  for (const r of readings) {
    if (r.location !== 'indoor' || r.humidityPct == null) continue;
    const threshold = previous.has(r.sensorId) ? HUMIDITY_OFF_PCT : HUMIDITY_ON_PCT;
    if (r.humidityPct < threshold) continue;
    if (outdoorAbs === null) {
      states.set(r.sensorId, {advice: 'unknown', targetPct: OPTIMAL_HUMIDITY_PCT});
      continue;
    }
    const indoorAbs = absoluteHumidity(r.temperatureC, r.humidityPct);
    if (indoorAbs - outdoorAbs < MIN_ABSOLUTE_DIFF_G_M3) {
      states.set(r.sensorId, {advice: 'keep-closed', targetPct: null});
      continue;
    }
    const reachable = reachableHumidity(r.temperatureC, outdoorAbs);
    states.set(r.sensorId, {advice: 'ventilate', targetPct: Math.round(Math.max(OPTIMAL_HUMIDITY_PCT, reachable))});
  }
  return states;
}
