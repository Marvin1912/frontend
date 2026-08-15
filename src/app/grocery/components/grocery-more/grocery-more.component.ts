import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-grocery-more',
  imports: [RouterLink, MatIcon],
  templateUrl: './grocery-more.component.html',
  styleUrl: './grocery-more.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroceryMoreComponent {
}
