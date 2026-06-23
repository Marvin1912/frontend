import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {startWith} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {ActivityType, SportActivity, SportActivityInput} from '../../models/nutrition.model';

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  {value: 'RUNNING', label: 'Laufen'},
  {value: 'SWIMMING', label: 'Schwimmen'},
  {value: 'CYCLING', label: 'Radfahren'},
  {value: 'WALKING', label: 'Gehen'},
  {value: 'STRENGTH_TRAINING', label: 'Krafttraining'},
  {value: 'OTHER', label: 'Sonstiges'}
];

/** Existing activity to edit, or null when adding a new one. */
export type ActivityEditDialogData = SportActivity | null;

/**
 * Add/edit form for a sport activity. `description` is only required when
 * `activityType` is `OTHER`, enforced reactively as the select changes.
 */
@Component({
  selector: 'app-activity-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    NoWheelDirective,
    MatSelect,
    MatOption,
    MatIcon,
    MatButton
  ],
  templateUrl: './activity-edit-dialog.component.html',
  styleUrl: './activity-edit-dialog.component.css'
})
export class ActivityEditDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<ActivityEditDialogComponent>);
  private data = inject<ActivityEditDialogData>(MAT_DIALOG_DATA);

  readonly activityTypes = ACTIVITY_TYPES;
  readonly title = this.data ? 'Aktivität bearbeiten' : 'Aktivität hinzufügen';

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      activityType: [this.data?.activityType ?? null, Validators.required],
      description: [this.data?.description ?? ''],
      kcalBurned: [this.data?.kcalBurned ?? null, [Validators.required, Validators.min(0)]]
    });

    const activityType = this.form.get('activityType')!;
    const description = this.form.get('description')!;
    activityType.valueChanges.pipe(
      startWith(activityType.value),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((value: ActivityType) => {
      description.setValidators(value === 'OTHER' ? Validators.required : null);
      description.updateValueAndValidity();
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result: SportActivityInput = {
      activityType: v.activityType,
      description: v.description?.trim() ? v.description.trim() : null,
      kcalBurned: Number(v.kcalBurned)
    };
    this.dialogRef.close(result);
  }
}
