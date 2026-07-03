import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NutritionService} from '../../services/nutrition.service';
import {MealPlan} from '../../models/nutrition.model';

@Component({
  selector: 'app-nutrition-meal-plan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinner],
  templateUrl: './nutrition-meal-plan.component.html',
  styleUrl: './nutrition-meal-plan.component.css'
})
export class NutritionMealPlanComponent implements OnInit {

  plan: MealPlan | null = null;
  loading = true;
  unavailable = false;

  private nutritionService = inject(NutritionService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.nutritionService.getMealPlan().subscribe({
      next: plan => {
        this.plan = plan;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.plan = null;
        this.loading = false;
        this.unavailable = true;
        this.cdr.markForCheck();
      }
    });
  }
}
