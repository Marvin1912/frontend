import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';

/** Views reached from "Mehr"; the tab stays highlighted while one of them is open. */
const MORE_ROUTES = ['/grocery/more', '/grocery/articles', '/grocery/categories', '/grocery/matching'];

@Component({
  selector: 'app-grocery-layout',
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './grocery-layout.component.html',
  styleUrl: './grocery-layout.component.css',
  // Eager: the routed views below are Eager too and are only checked when this view is
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {class: 'ui-bg grocery-scope'}
})
export class GroceryLayoutComponent {

  homeLink = signal('/');
  moreActive = signal(false);

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(event => {
        const home = this.getDeepestChild(this.route).snapshot.data['home'];
        this.homeLink.set(home || '/');
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        this.moreActive.set(MORE_ROUTES.some(route => path.startsWith(route)));
      });
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
