import {Component} from '@angular/core';
import {MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from "@angular/router";
import {filter} from 'rxjs';

@Component({
  selector: 'app-plant-root',
  imports: [
    MatFabButton,
    MatIcon,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './plant-root.component.html',
  styleUrl: './plant-root.component.css'
})
export class PlantRootComponent {

  homeLink: string = '/';

  constructor(private router: Router, private route: ActivatedRoute) {
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
