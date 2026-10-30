import {absoluteHumidity, reachableHumidity, ventilationAdvice} from './ventilation.util';
import {TemperatureReading} from '../models/temperature-reading.model';

function reading(sensorId: string, location: 'indoor' | 'outdoor', temperatureC: number, humidityPct?: number): TemperatureReading {
  return {sensorId, label: sensorId, location, temperatureC, humidityPct, measuredAt: '2026-10-30T20:00:00Z'};
}

describe('absoluteHumidity', () => {
  it('computes g/m³ from temperature and relative humidity', () => {
    expect(absoluteHumidity(20, 50)).toBeCloseTo(8.63, 1);
    expect(absoluteHumidity(11.5, 76)).toBeCloseTo(7.84, 1);
  });
});

describe('reachableHumidity', () => {
  it('converts outside absolute humidity to relative humidity at room temperature', () => {
    expect(reachableHumidity(20, absoluteHumidity(20, 42))).toBeCloseTo(42, 5);
    expect(reachableHumidity(20, absoluteHumidity(11.5, 76))).toBeCloseTo(45.4, 0);
  });
});

describe('ventilationAdvice', () => {
  const dryOutside = reading('out', 'outdoor', 11, 80);

  it('flags nothing below the threshold', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20, 64)], new Map());
    expect(advice.size).toBe(0);
  });

  it('recommends ventilating when outside air is absolutely drier', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')?.advice).toBe('ventilate');
  });

  it('advises keeping windows closed when outside air is not drier by the margin', () => {
    const humidOutside = reading('out', 'outdoor', 20, 95);
    const advice = ventilationAdvice([humidOutside, reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')).toEqual({advice: 'keep-closed', targetPct: null});
  });

  it('reports humid without a recommendation when outdoor data is missing', () => {
    const advice = ventilationAdvice([reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')).toEqual({advice: 'unknown', targetPct: 50});
  });

  it('keeps the warning between the off and on threshold (hysteresis)', () => {
    const readings = [dryOutside, reading('room', 'indoor', 20, 62)];
    expect(ventilationAdvice(readings, new Map()).has('room')).toBe(false);
    expect(ventilationAdvice(readings, new Map([['room', {advice: 'ventilate' as const, targetPct: 50}]])).get('room')?.advice).toBe('ventilate');
  });

  it('clears the warning once humidity drops below the off threshold', () => {
    const readings = [dryOutside, reading('room', 'indoor', 20, 59)];
    expect(ventilationAdvice(readings, new Map([['room', {advice: 'ventilate' as const, targetPct: 50}]])).has('room')).toBe(false);
  });

  it('targets the comfort optimum when outside air is dry enough to reach it', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')?.targetPct).toBe(50);
  });

  it('targets the reachable humidity when the optimum is out of reach', () => {
    const mildOutside = reading('out', 'outdoor', 14, 90);
    const advice = ventilationAdvice([mildOutside, reading('room', 'indoor', 20, 80)], new Map());
    expect(advice.get('room')).toEqual({advice: 'ventilate', targetPct: 63});
  });

  it('ignores indoor readings without humidity', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20)], new Map());
    expect(advice.size).toBe(0);
  });
});
