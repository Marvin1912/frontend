import {Component} from '@angular/core';
import {BackendComponent} from './backend/backend.component';

@Component({
  selector: 'app-root',
  imports: [BackendComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
