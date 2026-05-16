import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {TemperatureReading} from '../../models/temperature-reading.model';

type Freshness = 'fresh' | 'aging' | 'stale';

@Component({
  selector: 'app-temperature-card',
  imports: [],
  templateUrl: './temperature-card.component.html',
  styleUrl: './temperature-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-outdoor]': 'reading().location === "outdoor"',
    '[class.is-indoor]': 'reading().location === "indoor"'
  }
})
export class TemperatureCardComponent {

  reading = input.required<TemperatureReading>();

  temperatureDisplay = computed(() => this.reading().temperatureC.toFixed(1));

  humidityDisplay = computed(() => {
    const h = this.reading().humidityPct;
    return h === undefined ? null : Math.round(h);
  });

  freshness = computed<Freshness>(() => {
    const ageMs = Date.now() - new Date(this.reading().measuredAt).getTime();
    const ageMin = ageMs / 60_000;
    if (ageMin < 2) return 'fresh';
    if (ageMin < 10) return 'aging';
    return 'stale';
  });
}
