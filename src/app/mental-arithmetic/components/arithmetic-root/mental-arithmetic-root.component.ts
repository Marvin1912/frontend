import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from "@angular/router";
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-mental-arithmetic-root',
  imports: [
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './mental-arithmetic-root.component.html',
  styleUrl: './mental-arithmetic-root.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'ui-bg'}
})
export class MentalArithmeticRootComponent {

  // Signal, damit OnPush den Home-Link nach jeder Navigation aktualisiert
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
