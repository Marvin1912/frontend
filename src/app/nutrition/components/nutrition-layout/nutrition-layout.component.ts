import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {ExportDialogComponent} from '../../dialogs/export-dialog/export-dialog.component';

@Component({
  selector: 'app-nutrition-layout',
  imports: [
    MatIconButton,
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './nutrition-layout.component.html',
  styleUrl: './nutrition-layout.component.css'
})
export class NutritionLayoutComponent implements OnInit {

  homeLink = '/';

  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  openExportDialog(): void {
    this.dialog.open(ExportDialogComponent);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
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
