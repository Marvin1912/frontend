import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Plant} from '../../model/plant';
import {MatIcon} from '@angular/material/icon';
import {PlantLocation} from '../../model/plantLocation';
import {environment} from '../../../../environments/environment';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-show-plant-dialog',
  imports: [
    MatIcon,
    NgIf
  ],
  templateUrl: './show-plant-dialog.component.html',
  styleUrl: './show-plant-dialog.component.css'
})
export class ShowPlantDialogComponent implements OnChanges {

  @Input() plant: Plant | null = null;
  imageUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plant'] && this.plant) {
      this.imageUrl = this.plant.image ? `${environment.apiUrl}/images/${this.plant.image}` : null;
    }
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
