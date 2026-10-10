import {Component, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-plant-home',
  imports: [
    RouterLink
  ],
  templateUrl: './plant-home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plant-home.component.css'
})
export class PlantHomeComponent {

}
