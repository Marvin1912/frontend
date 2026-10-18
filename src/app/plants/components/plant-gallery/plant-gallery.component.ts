import {Component, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {PlantService} from '../../services/plant.service';
import {Plant} from '../../models/plant.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {tap} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-plant-gallery',
  imports: [DatePipe, MatIcon, MatProgressSpinner, RouterLink],
  templateUrl: './plant-gallery.component.html',
  styleUrl: './plant-gallery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class PlantGalleryComponent implements OnInit {

  plants = signal<Plant[]>([]);
  loadState = signal<'loading' | 'loaded' | 'error'>('loading');

  constructor(
    private plantService: PlantService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
  }

  // lokales Datum (yyyy-MM-dd); toISOString() liefert UTC und kurz nach Mitternacht den Vortag.
  // Wird beim Sortieren aktualisiert statt bei jeder Fälligkeitsprüfung neu berechnet.
  private today = '';

  private sortPlants(plants: Plant[]): Plant[] {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? '';
    return plants.sort((a, b) => {
      const aNeedsWater = this.isWateringDue(a);
      const bNeedsWater = this.isWateringDue(b);
      if (aNeedsWater && !bNeedsWater) return -1;
      if (!aNeedsWater && bNeedsWater) return 1;

      const aNeedsFert = this.isFertilizingDue(a);
      const bNeedsFert = this.isFertilizingDue(b);
      if (aNeedsFert && !bNeedsFert) return -1;
      if (!aNeedsFert && bNeedsFert) return 1;

      return (a.nextWateredDate || '').localeCompare(b.nextWateredDate || '');
    });
  }

  ngOnInit(): void {
    this.plantService.getPlants()
      .pipe(tap({
        next: plants => {
          this.plants.set(this.sortPlants(plants));
          this.loadState.set('loaded');
        }
      }))
      .subscribe({
        error: err => {
          this.loadState.set('error');
          this.snackBar.open(`Error fetching plants: ${err}`, 'Dismiss', {
            duration: 5000
          })
        }
      });
  }

  getImageUrl(plant: Plant) {
    return `${environment.apiUrl}/images/${plant.image}`
  }

  setWateredNow(plant: Plant) {
    const now: Date = new Date();
    const lastWateredDate = this.datePipe.transform(now, 'yyyy-MM-dd') ?? '1970-01-01';

    this.plantService.wateredPlant(plant.id, lastWateredDate).subscribe({
      next: ({nextWateredDate}) => {
        this.plants.update(plants => {
          return this.sortPlants(plants.map(p =>
            p.id === plant.id ? {
              ...p, lastWateredDate: lastWateredDate , nextWateredDate: nextWateredDate ?? null
            } : p
          ));
        });
        const formattedDate: string | null = this.datePipe.transform(now, 'dd.MM.yyyy');
        this.snackBar.open(`Set last watered to: ${formattedDate}`, 'Dismiss', {duration: 5000});
      },
      error: err => {
        this.snackBar.open(`Plant update failed: ${err}`, 'Dismiss', {
          duration: 5000
        })
      }
    });
  }

  setFertilizedNow(plant: Plant) {
    const now: Date = new Date();
    const lastFertilizedDate = this.datePipe.transform(now, 'yyyy-MM-dd') ?? '1970-01-01';

    this.plantService.fertilizedPlant(plant.id, lastFertilizedDate).subscribe({
      next: ({nextFertilizedDate}) => {
        this.plants.update(plants => {
          return this.sortPlants(plants.map(p =>
            p.id === plant.id ? {
              ...p, lastFertilizedDate: lastFertilizedDate, nextFertilizedDate: nextFertilizedDate ?? null
            } : p
          ));
        });
        const formattedDate: string | null = this.datePipe.transform(now, 'dd.MM.yyyy');
        this.snackBar.open(`Set last fertilized to: ${formattedDate}`, 'Dismiss', {duration: 5000});
      },
      error: err => {
        this.snackBar.open(`Plant update failed: ${err}`, 'Dismiss', {
          duration: 5000
        })
      }
    });
  }

  isWateringDue(plant: Plant): boolean {
    return plant.nextWateredDate ? plant.nextWateredDate <= this.today : false;
  }

  isFertilizingDue(plant: Plant): boolean {
    return plant.nextFertilizedDate ? plant.nextFertilizedDate <= this.today : false;
  }
}
