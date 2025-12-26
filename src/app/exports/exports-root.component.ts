import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exports-root',
  imports: [
    MatFabButton,
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatTabsModule,
    CommonModule
  ],
  templateUrl: './exports-root.component.html',
  styleUrl: './exports-root.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportsRootComponent {
  homeLink: string = '/';
  activeTab = 0;
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const home = this.getDeepestChild(this.route).snapshot.data['home'];
        this.homeLink = home || '/';
        this.updateActiveTab();
      });
    this.updateActiveTab();
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private updateActiveTab(): void {
    const url = this.router.url;
    if (url.includes('/exports/available')) {
      this.activeTab = 0;
    } else if (url.includes('/exports/history')) {
      this.activeTab = 1;
    } else if (url.includes('/exports/files')) {
      this.activeTab = 2;
    } else {
      this.activeTab = 0;
    }
  }

  onTabChange(index: number): void {
    const routes = ['/exports/available', '/exports/history', '/exports/files'];
    this.router.navigate([routes[index]]);
  }
}
