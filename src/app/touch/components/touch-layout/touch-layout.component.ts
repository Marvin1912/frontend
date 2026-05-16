import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';

@Component({
  selector: 'app-touch-layout',
  imports: [
    MatIcon,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './touch-layout.component.html',
  styleUrl: './touch-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchLayoutComponent {

  homeLink: string = '/';
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const home = this.getDeepestChild(this.route).snapshot.data['home'];
        this.homeLink = home || '/';
      });
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
