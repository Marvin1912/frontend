import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NutritionService} from '../../services/nutrition.service';
import {Targets} from '../../models/nutrition.model';

/**
 * Reusable card that shows the computed daily targets from
 * `GET /nutrition/targets`. Parents can trigger a re-fetch via {@link reload}
 * after the profile or weight log changes.
 */
@Component({
  selector: 'app-targets-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatIcon, MatProgressSpinner],
  templateUrl: './targets-card.component.html',
  styleUrl: './targets-card.component.css'
})
export class TargetsCardComponent implements OnInit {

  targets: Targets | null = null;
  loading = false;
  /** Set when targets cannot be computed (e.g. no profile / no weight yet). */
  unavailable: string | null = null;

  private nutritionService = inject(NutritionService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.unavailable = null;
    this.cdr.markForCheck();

    this.nutritionService.getTargets().subscribe({
      next: targets => {
        this.targets = targets;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.targets = null;
        this.loading = false;
        this.unavailable = err.status >= 400 && err.status < 500
          ? 'Noch keine Ziele berechenbar. Bitte zuerst ein Profil und mindestens einen Gewichtseintrag erfassen.'
          : 'Ziele konnten nicht geladen werden.';
        this.cdr.markForCheck();
      }
    });
  }
}
