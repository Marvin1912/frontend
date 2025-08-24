import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'vocabulary-home',
  imports: [
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './vocabulary-home.component.html',
  styleUrl: './vocabulary-home.component.css'
})
export class VocabularyHomeComponent {

}
