import {Component, OnInit} from '@angular/core';
import {Plant} from '../model/plant';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../environments/environment';
import {PlantService} from '../plant-service/plant.service';
import {MatCard, MatCardContent, MatCardHeader, MatCardImage, MatCardTitle} from '@angular/material/card';
import {DatePipe, NgIf} from '@angular/common';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-plant-details',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    NgIf,
    MatCardImage,
    MatCardContent,
    MatTabGroup,
    MatTab,
    DatePipe,
    MatTooltip
  ],
  templateUrl: './plant-details.component.html',
  styleUrl: './plant-details.component.css'
})
export class PlantDetailsComponent implements OnInit {

  plant: Plant | null = null;
  imageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private platService: PlantService
  ) {
  }

  ngOnInit(): void {
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

  getImageUrl(plant: Plant) {
    return `${environment.apiUrl}/images/${plant.image}`
  }

}
