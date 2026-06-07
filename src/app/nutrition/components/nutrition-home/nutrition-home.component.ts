import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TargetsCardComponent} from '../targets-card/targets-card.component';

@Component({
  selector: 'app-nutrition-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TargetsCardComponent],
  templateUrl: './nutrition-home.component.html',
  styleUrl: './nutrition-home.component.css'
})
export class NutritionHomeComponent {}
