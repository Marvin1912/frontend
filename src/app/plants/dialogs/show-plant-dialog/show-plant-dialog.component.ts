import {Component, Inject} from '@angular/core';
import {Plant} from '../../model/plant';
import {PLANT_DATA} from '../../tokens/plant-overlay-token';
import {MatIcon} from '@angular/material/icon';
import {PlantLocation} from '../../model/plantLocation';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-show-plant-dialog',
  imports: [
    MatIcon
  ],
  templateUrl: './show-plant-dialog.component.html',
  styleUrl: './show-plant-dialog.component.css'
})
export class ShowPlantDialogComponent {

  imageUrl: String | null = null;

  constructor(@Inject(PLANT_DATA) public plant: Plant) {
    this.imageUrl = `${environment.apiUrl}/images/${plant.image}`
  }

  getIcon(plant: Plant) {
    switch (plant.location) {
      case PlantLocation.BEDROOM:
        return 'single_bed';
      case PlantLocation.KITCHEN:
        return 'kitchen';
      case PlantLocation.LIVING_ROOM:
        return 'weekend';
      case PlantLocation.UNDEFINED:
        return 'not_listed_location';
    }
  }
}
