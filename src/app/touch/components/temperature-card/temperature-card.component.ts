import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {TemperatureReading} from '../../models/temperature-reading.model';

type Freshness = 'fresh' | 'aging' | 'stale';
export type TemperatureCardVariant = 'hero' | 'cell';

@Component({
  selector: 'app-temperature-card',
  imports: [],
  templateUrl: './temperature-card.component.html',
  styleUrl: './temperature-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-outdoor]': 'reading().location === "outdoor"',
    '[class.is-indoor]': 'reading().location === "indoor"',
    '[class.is-hero]': 'variant() === "hero"',
    '[class.is-cell]': 'variant() === "cell"'
  }
})
export class TemperatureCardComponent {

  reading = input.required<TemperatureReading>();
  variant = input<TemperatureCardVariant>('cell');

  temperatureDisplay = computed(() => this.reading().temperatureC.toFixed(1));

  freshness = computed<Freshness>(() => {
    const ageMin = (Date.now() - new Date(this.reading().measuredAt).getTime()) / 60_000;
    if (ageMin < 2) return 'fresh';
    if (ageMin < 10) return 'aging';
    return 'stale';
  });

  ageLabel = computed(() => {
    const ageMin = Math.max(0, Math.floor((Date.now() - new Date(this.reading().measuredAt).getTime()) / 60_000));
    if (ageMin < 1) return 'just now';
    if (ageMin === 1) return '1 min ago';
    if (ageMin < 60) return `${ageMin} min ago`;
    const hours = Math.floor(ageMin / 60);
    return hours === 1 ? '1 hr ago' : `${hours} hr ago`;
  });
}
