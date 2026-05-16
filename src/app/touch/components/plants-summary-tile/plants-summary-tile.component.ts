import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {map} from 'rxjs';
import {PlantService} from '../../../plants/services/plant.service';
import {Plant} from '../../../plants/models/plant.model';

interface UpcomingPlant {
  id: number;
  name: string;
  dueLabel: string;
  overdue: boolean;
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

  summary$ = this.plants.getPlants().pipe(
    map(plants => this.buildSummary(plants))
  );

  private buildSummary(plants: Plant[]): PlantsSummary {
    const now = Date.now();
    const upcoming = plants
      .filter((p): p is Plant & {nextWateredDate: string} => !!p.nextWateredDate)
      .sort((a, b) => new Date(a.nextWateredDate).getTime() - new Date(b.nextWateredDate).getTime())
      .slice(0, 3)
      .map(p => {
        const dueTime = new Date(p.nextWateredDate).getTime();
        return {
          id: p.id,
          name: p.name,
          dueLabel: this.formatDue(dueTime, now),
          overdue: dueTime < now
        };
      });

    return {total: plants.length, upcoming};
  }

  private formatDue(dueTime: number, now: number): string {
    const diffDays = Math.round((dueTime - now) / 86_400_000);
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays}d`;
  }
}
