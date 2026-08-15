import {Component} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatFabButton} from '@angular/material/button';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-grocery-layout',
  imports: [
    MatIcon,
    MatFabButton,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './grocery-layout.component.html',
  styleUrl: './grocery-layout.component.css'
})
export class GroceryLayoutComponent {
}
