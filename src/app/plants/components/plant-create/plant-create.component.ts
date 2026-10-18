import {Component, ChangeDetectionStrategy, signal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {DatePipe} from '@angular/common';
import {PlantService} from '../../services/plant.service';
import {PlantLocation} from '../../models/plant-location.enum';
import {Plant} from '../../models/plant.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-plant-create',
  imports: [
    // FormsModule: NgForm am Bild-Schritt (ohne formGroup) liefert ngSubmit
    FormsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  styleUrl: './plant-create.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './plant-create.component.html',
  providers: [DatePipe]
})
export class PlantCreateComponent {

  basicInfoForm: FormGroup;
  locationForm: FormGroup;
  careForm: FormGroup;

  readonly steps: { label: string, form: () => FormGroup | null }[] = [
    {label: 'Basic Info', form: () => this.basicInfoForm},
    {label: 'Location', form: () => this.locationForm},
    {label: 'Care Details', form: () => this.careForm},
    {label: 'Image', form: () => null},
  ];

  step = signal(0);
  submitting = signal(false);

  plantLocationOptions = Object.values(PlantLocation)
    .filter(value => PlantLocation.UNDEFINED !== value);
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private snackBar: MatSnackBar,
    private router: Router,
    private datePipe: DatePipe
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
      // natives Datumsfeld: yyyy-MM-dd im lokalen Datum
      lastWateredDate: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), Validators.required],
      careInstructions: ['', Validators.required],
      fertilizingFrequency: [null]
    });
  }

  isInvalid(form: FormGroup, name: string): boolean {
    const control = form.get(name);
    return !!control && control.invalid && control.touched;
  }

  // Linear: ein Schritt ist erreichbar, wenn alle vorherigen gültig sind
  canGoTo(index: number): boolean {
    return this.steps.slice(0, index).every(s => s.form()?.valid ?? true);
  }

  goTo(index: number) {
    if (this.canGoTo(index)) {
      this.step.set(index);
    }
  }

  next() {
    const form = this.steps[this.step()].form();
    if (form?.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.step.update(s => Math.min(s + 1, this.steps.length - 1));
  }

  back() {
    this.step.update(s => Math.max(s - 1, 0));
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
      careInstructions: this.careForm.value.careInstructions,
      nextWateredDate: null,
      image: null,
      fertilizingFrequency: this.careForm.value.fertilizingFrequency,
      lastFertilizedDate: null,
      nextFertilizedDate: null
    };

    this.submitting.set(true);
    this.plantService.createPlant(plant, this.selectedFile)
      .subscribe({
        next: (response) => {
          const location = response.headers.get('Location');
          this.navigateToPlant('/plant-root' + location)
        },
        error: () => {
          this.submitting.set(false);
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
