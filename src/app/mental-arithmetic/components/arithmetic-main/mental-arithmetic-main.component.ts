import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-mental-arithmetic-main',
  imports: [],
  templateUrl: './mental-arithmetic-main.component.html',
  styleUrl: './mental-arithmetic-main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentalArithmeticMainComponent {

  constructor(private router: Router) {}

  onStartTraining(): void {
    this.router.navigate(['/mental-arithmetic/session']);
  }

}