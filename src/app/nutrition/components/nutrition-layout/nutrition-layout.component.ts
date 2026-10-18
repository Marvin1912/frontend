import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {ExportDialogComponent} from '../../dialogs/export-dialog/export-dialog.component';
import {nutritionDialogConfig} from '../../dialogs/dialog-config';

@Component({
  selector: 'app-nutrition-layout',
  imports: [
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './nutrition-layout.component.html',
  styleUrl: './nutrition-layout.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {class: 'ui-bg nutrition-scope'}
})
export class NutritionLayoutComponent {

  homeLink = signal('/');

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const home = this.getDeepestChild(this.route).snapshot.data['home'];
        this.homeLink.set(home || '/');
      });
  }

  openExportDialog(): void {
    this.dialog.open(ExportDialogComponent, nutritionDialogConfig(undefined, '400px'));
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
