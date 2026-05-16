import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe, DatePipe} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, map, startWith, timer} from 'rxjs';

@Component({
  selector: 'app-touch-layout',
  imports: [AsyncPipe, DatePipe, RouterOutlet],
  templateUrl: './touch-layout.component.html',
  styleUrl: './touch-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchLayoutComponent {

  homeLink: string = '/';
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  now$ = timer(0, 60_000).pipe(
    map(() => new Date()),
    startWith(new Date())
  );

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
