import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {PlantService} from '../plant-service/plant.service';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {PlantLocation} from '../model/plantLocation';
import {Plant} from '../model/plant';
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from '@angular/material/stepper';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-plant-form',
  imports: [
    FormsModule,
    MatSnackBarModule,
    MatFormField,
    MatFormFieldModule,
    MatSelect,
    MatOption,
    MatStep,
    MatStepper,
    ReactiveFormsModule,
    MatStepLabel,
    MatInput,
    MatButton,
    MatStepperNext,
    MatStepperPrevious,
    NgForOf,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    NgIf
  ],
  standalone: true,
  styleUrl: './plant-form.component.css',
  templateUrl: './plant-form.component.html'
})
export class PlantFormComponent {

  basicInfoForm: FormGroup;
  locationForm: FormGroup;
  careForm: FormGroup;
  imageForm: FormGroup;

  plantLocationOptions = Object.values(PlantLocation)
    .filter(value => PlantLocation.UNDEFINED !== value);
  selectedFile: File | null = null;
  isSmallScreen = false;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private snackBar: MatSnackBar,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.locationForm = this.fb.group({
      location: ['', Validators.required]
    });

    this.careForm = this.fb.group({
      wateringFrequency: [0, [Validators.required, Validators.min(1)]],
      lastWateredDate: [new Date()]
    });

    this.imageForm = this.fb.group({
      image: [null]
    });

    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall]).subscribe({
      next: value => this.isSmallScreen = value.matches
    });
  }

  onFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput?.files?.length) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit() {

    const plant: Plant = {
      id: 0,
      name: this.basicInfoForm.value.name,
      species: this.basicInfoForm.value.species,
      description: this.basicInfoForm.value.description,
      location: this.locationForm.value.location,
      wateringFrequency: this.careForm.value.wateringFrequency,
      lastWateredDate: this.careForm.value.lastWateredDate,
      nextWateredDate: null,
      image: null
    };

    this.plantService.createPlant(plant, this.selectedFile)
      .subscribe({
        next: (response) => {
          const location = response.headers.get('Location');
          this.navigateToPlant('/plant-root' + location)
        },
        error: () => {
          this.snackBar.open(
            'Failed to create plant.',
            'Dismiss',
            {
              duration: 5000
            })
        }
      });
  }

  navigateToPlant(path: string | null) {
    void this.router.navigate([path]);
  }

}
