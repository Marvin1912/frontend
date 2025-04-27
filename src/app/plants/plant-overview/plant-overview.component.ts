import {Component, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {DatePipe, NgForOf} from '@angular/common';
import {PlantService} from '../plant-service/plant.service';
import {Plant} from '../model/plant';
import {MatSnackBar} from '@angular/material/snack-bar';
import {tap} from 'rxjs';

@Component({
  selector: 'app-plant-overview',
  imports: [MatCardModule, MatButtonModule, NgForOf, DatePipe],
  templateUrl: './plant-overview.component.html',
  styleUrl: './plant-overview.component.css',
  providers: [DatePipe]
})
export class PlantOverviewComponent implements OnInit {

  plants = signal<Plant[]>([]);

  constructor(
    private plantService: PlantService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.plantService.getPlants()
      .pipe(tap({
        next: plants => this.plants.set(plants.sort((a, b) => a.id - b.id))
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
    return `http://localhost:9001/images/${plant.image}`
  }

  setWateredNow(plant: Plant) {
    let now: Date = new Date();

    this.plantService.wateredPlant(plant.id, now).subscribe({
      next: ({nextWateredDate}) => {
        this.plants.update(plants => {
          return plants.map(p =>
            p.id === plant.id ? {
              ...p, lastWateredDate: now, nextWateredDate: nextWateredDate ?? null
            } : p
          ).sort((a, b) => a.id - b.id);
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
}
