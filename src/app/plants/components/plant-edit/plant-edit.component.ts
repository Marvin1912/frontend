import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PlantService} from '../../services/plant.service';
import {Plant} from '../../models/plant.model';
import { DatePipe } from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {PlantLocation} from '../../models/plant-location.enum';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../../environments/environment';
import {ImageService} from '../../services/image.service';

@Component({
  selector: 'app-plant-detail',
  imports: [
    MatIcon,
    FormsModule,
    DatePipe
  ],
  templateUrl: './plant-edit.component.html',
  styleUrl: './plant-edit.component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class PlantEditComponent implements OnInit {

  plant: Plant | null = null;
  tempPlant: Plant | null = null;

  imageUrl: string | null = null;
  selectedFile?: File;
  isEditMode: boolean = false;
  // Werte der nativen Datumsfelder im Format yyyy-MM-dd
  tmpLastWatered: string | null = null;
  tmpLastFertilized: string | null = null;

  plantLocationOptions = Object
    .values(PlantLocation)
    .filter(value => PlantLocation.UNDEFINED !== value);

  constructor(
    private route: ActivatedRoute,
    private platService: PlantService,
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    const rawId: string | null = this.route.snapshot.paramMap.get('id');
    if (rawId != null) {
      this.platService.getPlant(parseInt(rawId)).subscribe({
          next: plantResponse => {
            this.plant = plantResponse;
            if (plantResponse.image !== null) {
              this.imageUrl = `${environment.apiUrl}/images/${plantResponse.image}`
            }
          },
          error: err => console.log(err)
        }
      );
    }
  }

  toggleEditMode() {

    if (!this.isEditMode) {
      this.tempPlant = {...this.plant} as Plant;
      this.selectedFile = undefined;
      if (this.plant) {
        // type="date" akzeptiert nur yyyy-MM-dd
        this.tmpLastWatered = this.plant.lastWateredDate?.slice(0, 10) ?? null;
        this.tmpLastFertilized = this.plant.lastFertilizedDate?.slice(0, 10) ?? null;
      }
    } else {
      this.tempPlant = null;
      this.selectedFile = undefined;
    }

    this.isEditMode = !this.isEditMode;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  saveChanges() {
    this.isEditMode = !this.isEditMode;

    if (!this.tempPlant) {
      return;
    }

    if (this.selectedFile) {
      this.imageService.createImage(this.selectedFile).subscribe({
        next: response => {
          this.selectedFile = undefined;
          const imageUuid = this.imageService.extractUuidFromResponse(response) ?? this.plant?.image ?? '';
          this.tempPlant = this.buildUpdatedPlant(imageUuid);
          this.updatePlant(true);
        },
        error: _ => {
          this.snackBar.open('Failed to update image.', 'Dismiss', {duration: 5000})
        }
      })
    } else {
      this.tempPlant = this.buildUpdatedPlant();
      this.updatePlant(false);
    }
  }

  private buildUpdatedPlant(image?: string): Plant {
    // Leeres Datumsfeld behält den bisherigen Wert
    const lastWateredDate = this.tmpLastWatered || this.plant?.lastWateredDate;
    const lastFertilizedDate = this.tmpLastFertilized || this.plant?.lastFertilizedDate;

    return {
      ...this.tempPlant,
      ...(image !== undefined ? {image} : {}),
      lastWateredDate,
      lastFertilizedDate
    } as Plant;
  }

  private updatePlant(refreshImageUrl: boolean) {
    if (!this.tempPlant) {
      return;
    }

    this.platService.updatePlant(this.tempPlant).subscribe({
      next: _ => {
        this.plant = {...this.tempPlant} as Plant;
        if (refreshImageUrl) {
          this.imageUrl = `${environment.apiUrl}/images/${this.plant.image}`
        }
        this.snackBar.open(`Plant updated!`, 'Dismiss', {duration: 5000})
      },
      error: _ => {
        this.snackBar.open('Failed to update plant.', 'Dismiss', {duration: 5000})
      }
    })
  }

}

