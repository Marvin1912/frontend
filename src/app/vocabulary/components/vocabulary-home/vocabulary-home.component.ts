import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'vocabulary-home',
  imports: [
    RouterLink,
    RouterOutlet,
    MatFabButton,
    MatIcon
  ],
  templateUrl: './vocabulary-home.component.html',
  styleUrl: './vocabulary-home.component.css'
})
export class VocabularyHomeComponent {

}
