import {Component, OnInit, signal} from '@angular/core';
import {DatePipe, NgClass, NgForOf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {PlantService} from '../../services/plant.service';
import {Plant} from '../../models/plant.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {tap} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-plant-gallery',
  imports: [MatCardModule, MatButtonModule, NgForOf, RouterLink, NgClass],
  templateUrl: './plant-gallery.component.html',
  styleUrl: './plant-gallery.component.css',
  providers: [DatePipe]
})
export class PlantGalleryComponent implements OnInit {

  plants = signal<Plant[]>([]);

  constructor(
    private plantService: PlantService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private needsWatering(plant: Plant): boolean {
    return plant.nextWateredDate ? plant.nextWateredDate <= this.today() : false;
  }

  private needsFertilizing(plant: Plant): boolean {
    return plant.nextFertilizedDate ? plant.nextFertilizedDate <= this.today() : false;
  }

  private sortPlants(plants: Plant[]): Plant[] {
    return plants.sort((a, b) => {
      const aNeedsWater = this.needsWatering(a);
      const bNeedsWater = this.needsWatering(b);
      if (aNeedsWater && !bNeedsWater) return -1;
      if (!aNeedsWater && bNeedsWater) return 1;

      const aNeedsFert = this.needsFertilizing(a);
      const bNeedsFert = this.needsFertilizing(b);
      if (aNeedsFert && !bNeedsFert) return -1;
      if (!aNeedsFert && bNeedsFert) return 1;

      return (a.nextWateredDate || '').localeCompare(b.nextWateredDate || '');
    });
  }

  ngOnInit(): void {
    this.plantService.getPlants()
      .pipe(tap({
        next: plants => this.plants.set(this.sortPlants(plants))
      }))
      .subscribe({
        error: err => {
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
    return plant.nextWateredDate ? plant.nextWateredDate <= this.today() : false;
  }

  isFertilizingDue(plant: Plant): boolean {
    return plant.nextFertilizedDate ? plant.nextFertilizedDate <= this.today() : false;
  }
}
