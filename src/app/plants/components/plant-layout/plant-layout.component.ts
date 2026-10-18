import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from "@angular/router";
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-plant-layout',
  imports: [
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './plant-layout.component.html',
  styleUrl: './plant-layout.component.css',
  // Eager: OnPush würde die Eager-Kinder (Edit, Create) nach HTTP-Antworten nicht mehr prüfen
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {class: 'ui-bg'}
})
export class PlantLayoutComponent {

  homeLink = signal('/');
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const home = this.getDeepestChild(this.route).snapshot.data['home'];
        this.homeLink.set(home || '/');
      })
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
