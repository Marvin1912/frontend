import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe, formatDate} from '@angular/common';
import {RouterLink} from '@angular/router';
import {EMPTY, Subject, catchError, map, merge, switchMap, timer} from 'rxjs';
import {PlantService} from '../../../plants/services/plant.service';
import {Plant} from '../../../plants/models/plant.model';

const PLANTS_REFRESH_MS = 3_600_000;

interface UpcomingPlant {
  id: number;
  name: string;
  dueLabel: string;
  overdue: boolean;
  needsWater: boolean;
  needsFertilize: boolean;
}

interface PlantsSummary {
  total: number;
  upcoming: UpcomingPlant[];
}

@Component({
  selector: 'app-plants-summary-tile',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './plants-summary-tile.component.html',
  styleUrl: './plants-summary-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantsSummaryTileComponent {

  private plants = inject(PlantService);
  private refresh$ = new Subject<void>();

  summary$ = merge(timer(0, PLANTS_REFRESH_MS), this.refresh$).pipe(
    switchMap(() => this.plants.getPlants().pipe(
      catchError(() => EMPTY)
    )),
    map(plants => this.buildSummary(plants))
  );

  water(id: number, ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
    this.plants.wateredPlant(id, this.today()).subscribe({
      next: () => this.refresh$.next(),
      error: err => console.error('Watering plant failed', err)
    });
  }

  fertilize(id: number, ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
    this.plants.fertilizedPlant(id, this.today()).subscribe({
      next: () => this.refresh$.next(),
      error: err => console.error('Fertilizing plant failed', err)
    });
  }

  private today(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  private buildSummary(plants: Plant[]): PlantsSummary {
    const today = this.today();
    const nowMidnight = new Date(today).getTime();
    const upcoming = plants
      .map(p => this.toDuePlant(p, today, nowMidnight))
      .filter((p): p is UpcomingPlant & {referenceTime: number} => p !== null)
      .sort((a, b) => a.referenceTime - b.referenceTime)
      .slice(0, 3)
      .map(({referenceTime, ...rest}) => rest);

    return {total: plants.length, upcoming};
  }

  private toDuePlant(
    plant: Plant,
    today: string,
    nowMidnight: number
  ): (UpcomingPlant & {referenceTime: number}) | null {
    const needsWater = !!plant.nextWateredDate && plant.nextWateredDate <= today;
    const needsFertilize = !!plant.nextFertilizedDate && plant.nextFertilizedDate <= today;
    if (!needsWater && !needsFertilize) {
      return null;
    }
    const candidates: number[] = [];
    if (needsWater && plant.nextWateredDate) {
      candidates.push(new Date(plant.nextWateredDate).getTime());
    }
    if (needsFertilize && plant.nextFertilizedDate) {
      candidates.push(new Date(plant.nextFertilizedDate).getTime());
    }
    const referenceTime = Math.min(...candidates);
    return {
      id: plant.id,
      name: plant.name,
      dueLabel: this.formatDue(referenceTime, nowMidnight),
      overdue: referenceTime < nowMidnight,
      needsWater,
      needsFertilize,
      referenceTime
    };
  }

  private formatDue(dueTime: number, now: number): string {
    const diffDays = Math.round((dueTime - now) / 86_400_000);
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays}d`;
  }
}
