import {absoluteHumidity, ventilationAdvice} from './ventilation.util';
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

describe('ventilationAdvice', () => {
  const dryOutside = reading('out', 'outdoor', 11, 80);

  it('flags nothing below the threshold', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20, 64)], new Map());
    expect(advice.size).toBe(0);
  });

  it('recommends ventilating when outside air is absolutely drier', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')).toBe('ventilate');
  });

  it('advises keeping windows closed when outside air is not drier by the margin', () => {
    const humidOutside = reading('out', 'outdoor', 20, 95);
    const advice = ventilationAdvice([humidOutside, reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')).toBe('keep-closed');
  });

  it('reports humid without a recommendation when outdoor data is missing', () => {
    const advice = ventilationAdvice([reading('room', 'indoor', 20, 70)], new Map());
    expect(advice.get('room')).toBe('unknown');
  });

  it('keeps the warning between the off and on threshold (hysteresis)', () => {
    const readings = [dryOutside, reading('room', 'indoor', 20, 62)];
    expect(ventilationAdvice(readings, new Map()).has('room')).toBe(false);
    expect(ventilationAdvice(readings, new Map([['room', 'ventilate']])).get('room')).toBe('ventilate');
  });

  it('clears the warning once humidity drops below the off threshold', () => {
    const readings = [dryOutside, reading('room', 'indoor', 20, 59)];
    expect(ventilationAdvice(readings, new Map([['room', 'ventilate']])).has('room')).toBe(false);
  });

  it('ignores indoor readings without humidity', () => {
    const advice = ventilationAdvice([dryOutside, reading('room', 'indoor', 20)], new Map());
    expect(advice.size).toBe(0);
  });
});
