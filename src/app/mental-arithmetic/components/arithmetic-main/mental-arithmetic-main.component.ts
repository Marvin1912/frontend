import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-mental-arithmetic-main',
  imports: [
    RouterLink
  ],
  templateUrl: './mental-arithmetic-main.component.html',
  styleUrl: './mental-arithmetic-main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentalArithmeticMainComponent {

}