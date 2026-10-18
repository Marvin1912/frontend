import {Component, OnInit, ChangeDetectionStrategy, signal} from '@angular/core';
import {Plant} from '../../models/plant.model';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {PlantService} from '../../services/plant.service';
import {DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

type PlantTab = 'description' | 'care';

@Component({
  selector: 'app-plant-view',
  imports: [
    DatePipe,
    MatIcon,
    MatProgressSpinner,
    RouterLink,
  ],
  templateUrl: './plant-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './plant-view.component.css'
})
export class PlantViewComponent implements OnInit {

  readonly tabs: { id: PlantTab, label: string }[] = [
    {id: 'description', label: 'Beschreibung'},
    {id: 'care', label: 'Pflegehinweise'},
  ];

  plant = signal<Plant | null>(null);
  loadState = signal<'loading' | 'loaded' | 'error'>('loading');
  activeTab = signal<PlantTab>('description');

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
            this.plant.set(plantResponse);
            this.loadState.set('loaded');
          },
          error: err => {
            console.log(err);
            this.loadState.set('error');
          }
        }
      );
    } else {
      this.loadState.set('error');
    }
  }

  getImageUrl(plant: Plant) {
    return `${environment.apiUrl}/images/${plant.image}`
  }

  // Pfeiltasten wechseln zwischen den Tabs (WAI-ARIA Tabs-Muster)
  onTabKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    const index = this.tabs.findIndex(tab => tab.id === this.activeTab());
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = this.tabs[(index + step + this.tabs.length) % this.tabs.length];
    this.activeTab.set(next.id);
    document.getElementById('plant-tab-' + next.id)?.focus();
  }

}
