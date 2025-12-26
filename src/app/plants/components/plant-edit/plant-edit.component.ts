import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PlantService} from '../../services/plant.service';
import {Plant} from '../../models/plant.model';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/core';
import {MatLabel, MatSelect, MatSuffix} from '@angular/material/select';
import {PlantLocation} from '../../models/plant-location.enum';
import {MatInput} from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../../environments/environment';
import {ImageService} from '../../services/image.service';

@Component({
  selector: 'app-plant-detail',
  imports: [
    NgIf,
    MatIcon,
    FormsModule,
    NgClass,
    MatMiniFabButton,
    MatOption,
    MatSelect,
    NgForOf,
    ReactiveFormsModule,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepicker,
    MatDatepickerToggle,
    MatSuffix
  ],
  templateUrl: './plant-edit.component.html',
  styleUrl: './plant-edit.component.css',
  providers: [DatePipe]
})
export class PlantEditComponent implements OnInit {

  plant: Plant | null = null;
  tempPlant: Plant | null = null;

  imageUrl: string | null = null;
  selectedFile?: File;
  isEditMode: boolean = false;
  tmpLastWatered: Date | null = null;

  plantLocationOptions = Object
    .values(PlantLocation)
    .filter(value => PlantLocation.UNDEFINED !== value);

  constructor(
    private route: ActivatedRoute,
    private platService: PlantService,
    private imageService: ImageService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
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
      if (this.plant) {
        this.tmpLastWatered = new Date(Date.parse(this.plant.lastWateredDate ?? '1970-01-01'));
      }
    } else {
      this.tempPlant = null;
    }

    this.isEditMode = !this.isEditMode;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  // TODO: Extract the calls to plantService
  // TODO: Introduce a general component or function to map the string format
  saveChanges() {
    this.isEditMode = !this.isEditMode;

    if (this.selectedFile) {
      this.imageService.createImage(this.selectedFile).subscribe({
        next: response => {
          const imageUuid = this.imageService.extractUuidFromResponse(response) ?? this.plant?.image ?? '';
          if (this.tempPlant) {
            this.tempPlant.image = imageUuid;

            const lastWateredDate =
              this.datePipe.transform(this.tmpLastWatered, 'yyyy-MM-dd') ?? this.plant?.lastWateredDate;
            this.tempPlant = {...this.tempPlant, lastWateredDate: lastWateredDate} as Plant;

            this.platService.updatePlant(this.tempPlant).subscribe({
              next: _ => {
                this.plant = {...this.tempPlant} as Plant;
                this.imageUrl = `${environment.apiUrl}/images/${this.plant.image}`
                this.snackBar.open(`Plant updated!`, 'Dismiss', {duration: 5000})
              },
              error: _ => {
                this.snackBar.open('Failed to update plant.', 'Dismiss', {duration: 5000})
              }
            })
          }
        },
        error: _ => {
          this.snackBar.open('Failed to update image.', 'Dismiss', {duration: 5000})
        }
      })
    } else {
      if (this.tempPlant) {

        const lastWateredDate =
          this.datePipe.transform(this.tmpLastWatered, 'yyyy-MM-dd') ?? this.plant?.lastWateredDate;
        this.tempPlant = {...this.tempPlant, lastWateredDate: lastWateredDate} as Plant;

        this.platService.updatePlant(this.tempPlant).subscribe({
          next: _ => {
            this.plant = {...this.tempPlant} as Plant;
            this.snackBar.open(`Plant updated!`, 'Dismiss', {duration: 5000})
          },
          error: _ => {
            this.snackBar.open('Failed to update plant.', 'Dismiss', {duration: 5000})
          }
        })
      }
    }

  }

}

