import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PlantService} from '../plant-service/plant.service';
import {Plant} from '../model/plant';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/core';
import {MatLabel, MatSelect, MatSuffix} from '@angular/material/select';
import {PlantLocation} from '../model/plantLocation';
import {MatInput} from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';

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
    MatSuffix,
    DatePipe
  ],
  templateUrl: './plant-detail.component.html',
  styleUrl: './plant-detail.component.css'
})
export class PlantDetailComponent implements OnInit {

  plant: Plant | null = null;
  tempPlant: Plant | null = null;

  imageUrl: String | null = null;
  isEditMode: boolean = false;

  plantLocationOptions = Object
    .values(PlantLocation)
    .filter(value => PlantLocation.UNDEFINED !== value);

  constructor(
    private route: ActivatedRoute,
    private platService: PlantService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    let rawId: string | null = this.route.snapshot.paramMap.get('id');
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
      )
      ;
    }
  }

  toggleEditMode() {

    if (!this.isEditMode) {
      this.tempPlant = {...this.plant} as Plant;
    } else {
      this.tempPlant = null;
    }

    this.isEditMode = !this.isEditMode;
  }

  saveChanges() {
    this.isEditMode = !this.isEditMode;
    if (this.tempPlant !== null) {
      this.platService.updatePlant(this.tempPlant).subscribe({
        next: value => {
          this.plant = {...this.tempPlant} as Plant;
          this.snackBar.open(`Plant updated!`, 'Dismiss',
            {
              duration: 5000
            })
        },
        error: err => {
          this.snackBar.open('Failed to create plant.', 'Dismiss',
            {
              duration: 5000
            })
        }
      })
    }
  }
}

