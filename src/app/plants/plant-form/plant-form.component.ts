import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Plant} from '../model/plant';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {PlantService} from '../plant-service/plant.service';

@Component({
  selector: 'app-plant-form',
  imports: [
    FormsModule,
    MatSnackBarModule
  ],
  standalone: true,
  styleUrl: './plant-form.component.css',
  templateUrl: './plant-form.component.html'
})
export class PlantFormComponent {

  plant: Plant = {
    id: 0,
    name: '',
    description: '',
    image: null
  }

  constructor(private plantService: PlantService, private snackBar: MatSnackBar) {
  }

  onSubmit() {
    this.plantService.createPlant(this.plant)
      .subscribe({
        next: (response) => {
          const location = response.headers.get('Location');
          const snackBarRef = this.snackBar.open(
            `Plant ${this.plant.name} created!`,
            'View',
            {
              duration: 5000
            })
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
}
