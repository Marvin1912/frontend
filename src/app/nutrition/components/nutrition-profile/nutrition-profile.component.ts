import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {format, parseISO} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {ActivityLevel, Goal, ProfileInput, Sex} from '../../models/nutrition.model';
import {TargetsCardComponent} from '../targets-card/targets-card.component';

@Component({
  selector: 'app-nutrition-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatSuffix,
    MatInput,
    NoWheelDirective,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatButton,
    MatIcon,
    TargetsCardComponent
  ],
  templateUrl: './nutrition-profile.component.html',
  styleUrl: './nutrition-profile.component.css'
})
export class NutritionProfileComponent implements OnInit {

  @ViewChild(TargetsCardComponent) targetsCard?: TargetsCardComponent;

  form!: FormGroup;
  saving = false;

  readonly sexes: {value: Sex; label: string}[] = [
    {value: 'MALE', label: 'Männlich'},
    {value: 'FEMALE', label: 'Weiblich'}
  ];

  readonly activityLevels: {value: ActivityLevel; label: string}[] = [
    {value: 'SEDENTARY', label: 'Sitzend (wenig Bewegung)'},
    {value: 'LIGHT', label: 'Leicht aktiv'},
    {value: 'MODERATE', label: 'Mäßig aktiv'},
    {value: 'ACTIVE', label: 'Aktiv'},
    {value: 'VERY_ACTIVE', label: 'Sehr aktiv'}
  ];

  readonly goals: {value: Goal; label: string}[] = [
    {value: 'CUT', label: 'Abnehmen'},
    {value: 'MAINTAIN', label: 'Halten'},
    {value: 'BULK', label: 'Aufbauen'}
  ];

  private fb = inject(FormBuilder);
  private nutritionService = inject(NutritionService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.form = this.fb.group({
      sex: ['MALE' as Sex, Validators.required],
      birthDate: [null as Date | null, Validators.required],
      heightCm: [null as number | null, [Validators.required, Validators.min(0)]],
      activityLevel: ['MODERATE' as ActivityLevel, Validators.required],
      goal: ['MAINTAIN' as Goal, Validators.required],
      proteinPerKg: [2.0, [Validators.required, Validators.min(0)]],
      // Presented as a percentage (e.g. 30 for 30 %); converted to a fraction on save.
      fatPctPercent: [30, [Validators.required, Validators.min(0), Validators.max(100)]],
      basalKcal: [null as number | null, Validators.min(0)]
    });

    this.nutritionService.getProfile().subscribe({
      next: profile => {
        this.form.patchValue({
          sex: profile.sex,
          birthDate: parseISO(profile.birthDate),
          heightCm: profile.heightCm,
          activityLevel: profile.activityLevel,
          goal: profile.goal,
          proteinPerKg: profile.proteinPerKg,
          fatPctPercent: Math.round(profile.fatPct * 100),
          basalKcal: profile.basalKcal
        });
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        // 404 simply means no profile yet — keep the form defaults.
        if (err.status !== 404) {
          this.snackBar.open('Profil konnte nicht geladen werden', 'Schließen', {duration: 5000});
        }
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const payload: ProfileInput = {
      sex: v.sex,
      birthDate: format(v.birthDate, 'yyyy-MM-dd'),
      heightCm: Number(v.heightCm),
      activityLevel: v.activityLevel,
      goal: v.goal,
      proteinPerKg: Number(v.proteinPerKg),
      fatPct: Number(v.fatPctPercent) / 100,
      basalKcal: v.basalKcal === null || v.basalKcal === '' ? null : Number(v.basalKcal)
    };

    this.saving = true;
    this.cdr.markForCheck();
    this.nutritionService.updateProfile(payload).subscribe({
      next: () => {
        this.saving = false;
        this.targetsCard?.reload();
        this.cdr.markForCheck();
        this.snackBar.open('Profil gespeichert', 'OK', {duration: 3000});
      },
      error: () => {
        this.saving = false;
        this.cdr.markForCheck();
        this.snackBar.open('Profil konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
      }
    });
  }
}
