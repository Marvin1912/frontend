import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ArithmeticSettings, Difficulty, OperationType } from '../../model/arithmetic-settings';
import { ArithmeticService } from '../../services/arithmetic.service';

@Component({
  selector: 'app-arithmetic-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './arithmetic-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./arithmetic-settings.component.css']
})
export class ArithmeticSettingsComponent implements OnInit {
  settingsForm!: FormGroup;

  // Enums for template
  readonly Difficulty = Difficulty;

  constructor(
    private formBuilder: FormBuilder,
    private arithmeticService: ArithmeticService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedSettings();
  }

  private initializeForm(): void {
    this.settingsForm = this.formBuilder.group({
      operations: this.formBuilder.group({
        addition: [true, [Validators.required]],
        subtraction: [false, [Validators.required]]
      }, { validators: this.atLeastOneOperationSelected }),
      difficulty: [Difficulty.EASY, [Validators.required]],
      timeLimit: [null, [Validators.min(1), Validators.max(60)]],
      problemCount: [10, [Validators.required, Validators.min(5), Validators.max(50)]]
    });
  }

  private loadSavedSettings(): void {
    this.arithmeticService.loadSettingsFromStorage().subscribe({
      next: (savedSettings) => {
        if (savedSettings) {
          this.settingsForm.patchValue({
            operations: {
              addition: savedSettings.operations.includes(OperationType.ADDITION),
              subtraction: savedSettings.operations.includes(OperationType.SUBTRACTION)
            },
            difficulty: savedSettings.difficulty,
            timeLimit: savedSettings.timeLimit,
            problemCount: savedSettings.problemCount
          });
        }
      },
      error: (error) => {
        console.error('Error loading settings:', error);
      }
    });
  }

  private atLeastOneOperationSelected(group: FormGroup): { [key: string]: boolean } | null {
    const addition = group.get('addition')?.value;
    const subtraction = group.get('subtraction')?.value;

    if (!addition && !subtraction) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  private buildSettings(): ArithmeticSettings | null {
    if (!this.settingsForm.valid) {
      return null;
    }

    const formValue = this.settingsForm.value;

    // Build operations array
    const operations: OperationType[] = [];
    if (formValue.operations.addition) {
      operations.push(OperationType.ADDITION);
    }
    if (formValue.operations.subtraction) {
      operations.push(OperationType.SUBTRACTION);
    }

    return {
      operations: operations,
      difficulty: formValue.difficulty,
      timeLimit: formValue.timeLimit,
      problemCount: formValue.problemCount,
      showImmediateFeedback: true,
      allowPause: true,
      showProgress: true,
      showTimer: true,
      enableSound: false,
      useKeypad: false,
      shuffleProblems: true,
      repeatIncorrectProblems: false,
      maxRetries: 1,
      showCorrectAnswer: true,
      displaySettings: {
        fontSize: 'medium',
        highContrast: false
      }
    };
  }

  onSaveSettings(): void {
    const settings = this.buildSettings();
    if (settings) {
      this.arithmeticService.saveSettingsToStorage(settings).subscribe({
        next: () => this.snackBar.open('Einstellungen gespeichert', 'OK', { duration: 3000 }),
        error: (error) => console.error('Error saving settings:', error)
      });
    }
  }

  onStartTraining(): void {
    const settings = this.buildSettings();
    if (settings) {
      this.arithmeticService.saveSettingsToStorage(settings).subscribe({
        next: () => {
          this.router.navigate(['/mental-arithmetic/session']);
        },
        error: (error) => console.error('Error saving settings:', error)
      });
    }
  }

  operationsError(): string {
    return this.settingsForm.get('operations')?.hasError('atLeastOneRequired')
      ? 'Wählen Sie mindestens eine Rechenart aus'
      : '';
  }

  isInvalid(controlName: string): boolean {
    const control = this.settingsForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

}
