import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { ArithmeticSettings, Difficulty, OperationType } from '../../model/arithmetic-settings';
import { ArithmeticService } from '../../services/arithmetic.service';

@Component({
  selector: 'app-arithmetic-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule
  ],
  templateUrl: './arithmetic-settings.component.html',
  styleUrls: ['./arithmetic-settings.component.css']
})
export class ArithmeticSettingsComponent implements OnInit {
  settingsForm!: FormGroup;

  // Enums for template
  readonly Difficulty = Difficulty;
  readonly OperationType = OperationType;

  constructor(
    private formBuilder: FormBuilder,
    private arithmeticService: ArithmeticService,
    private router: Router
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
    const savedSettings = this.arithmeticService.loadSettingsFromStorage();
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
  }

  private atLeastOneOperationSelected(group: FormGroup): { [key: string]: boolean } | null {
    const addition = group.get('addition')?.value;
    const subtraction = group.get('subtraction')?.value;

    if (!addition && !subtraction) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  onSaveSettings(): void {
    if (this.settingsForm.valid) {
      const formValue = this.settingsForm.value;

      // Build operations array
      const operations: OperationType[] = [];
      if (formValue.operations.addition) {
        operations.push(OperationType.ADDITION);
      }
      if (formValue.operations.subtraction) {
        operations.push(OperationType.SUBTRACTION);
      }

      const settings: ArithmeticSettings = {
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

      this.arithmeticService.saveSettingsToStorage(settings);
    }
  }

  onStartTraining(): void {
    if (this.settingsForm.valid) {
      this.onSaveSettings();
      this.router.navigate(['/mental-arithmetic/session']);
    }
  }

  getErrorMessage(): string {
    const operationsGroup = this.settingsForm.get('operations');
    if (operationsGroup?.hasError('atLeastOneRequired')) {
      return 'Wählen Sie mindestens eine Rechenart aus';
    }

    const problemCount = this.settingsForm.get('problemCount');
    if (problemCount?.hasError('required')) {
      return 'Anzahl der Aufgaben ist erforderlich';
    }
    if (problemCount?.hasError('min')) {
      return 'Mindestens 5 Aufgaben';
    }
    if (problemCount?.hasError('max')) {
      return 'Maximal 50 Aufgaben';
    }

    const timeLimit = this.settingsForm.get('timeLimit');
    if (timeLimit?.hasError('min')) {
      return 'Mindestens 1 Minute';
    }
    if (timeLimit?.hasError('max')) {
      return 'Maximal 60 Minuten';
    }

    return '';
  }

  // Helper method for template
  formatTimeLimitLabel(value: number | null): string {
    return value ? `${value} Minuten` : 'Keine Zeitbegrenzung';
  }
}