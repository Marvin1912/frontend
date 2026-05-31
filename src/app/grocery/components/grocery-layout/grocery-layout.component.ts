import {Component} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-grocery-layout',
  imports: [
    MatIconButton,
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './grocery-layout.component.html',
  styleUrl: './grocery-layout.component.css'
})
export class GroceryLayoutComponent {

  homeLink = '/';

  constructor(private router: Router, private route: ActivatedRoute) {
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
