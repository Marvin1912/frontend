import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from "@angular/router";
import {filter} from 'rxjs';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-mental-arithmetic-root',
  imports: [
    MatFabButton,
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './mental-arithmetic-root.component.html',
  styleUrl: './mental-arithmetic-root.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentalArithmeticRootComponent {

  homeLink: string = '/';
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const home = this.getDeepestChild(this.route).snapshot.data['home'];
        this.homeLink = home || '/';
      })
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}