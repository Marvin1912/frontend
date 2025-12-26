import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Plant} from '../../models/plant.model';
import {MatIcon} from '@angular/material/icon';
import {PlantLocation} from '../../models/plant-location.enum';
import {environment} from '../../../../environments/environment';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-plant-preview',
  imports: [
    MatIcon,
    NgIf
  ],
  templateUrl: './plant-preview.component.html',
  styleUrl: './plant-preview.component.css'
})
export class PlantPreviewComponent implements OnChanges {

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
