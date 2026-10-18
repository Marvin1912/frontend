import {ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {Router} from '@angular/router';

import {ArithmeticSession} from '../../model/arithmetic-session';
import {ArithmeticProblem} from '../../model/arithmetic-problem';
import {ArithmeticSettings} from '../../model/arithmetic-settings';
import {SessionStatus} from '../../model/arithmetic-enums';
import {ArithmeticService} from '../../services/arithmetic.service';

@Component({
  selector: 'app-arithmetic-session',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CdkTrapFocus,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './arithmetic-session.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./arithmetic-session.component.css']
})
export class ArithmeticSessionComponent implements OnInit, OnDestroy {
  // Session state
  currentSession: ArithmeticSession | null = null;
  currentProblem: ArithmeticProblem | null = null;
  answerForm!: FormGroup;

  // Timer state
  private timerInterval: any = null;
  timeRemaining: number = 0;
  timeElapsed: number = 0;
  sessionTimeLimit: number | null = null;
  currentProblemStartTime: number = 0;

  // UI state
  isPaused: boolean = false;
  showFeedback: boolean = false;
  lastAnswerCorrect: boolean = false;
  isSessionCompleted: boolean = false;
  isSessionStarted: boolean = false;

  // Loading state
  isLoading: boolean = false;

  // Ziffernblock ohne letzte Zeile (+/-, 0, Backspace)
  readonly padDigits = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  constructor(
    private arithmeticService: ArithmeticService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeSessionFromCache();
  }

  private initializeSessionFromCache(): void {
    const settings = this.arithmeticService.getCurrentSettings();
    if (!settings) {
      // Fallback: load settings synchronously if not cached yet
      this.loadSettingsAndStartSession();
    } else {
      this.initializeSession(settings);
      this.startSession();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    // Save session if it exists and is active
    if (this.currentSession && this.currentSession.status === SessionStatus.ACTIVE) {
      this.pauseSession();
    }
  }

  private initializeForm(): void {
    this.answerForm = this.fb.group({
      userAnswer: ['', [Validators.required, Validators.pattern(/^-?\d+$/)]]
    });
  }

  private loadSettingsAndStartSession(): void {
    this.isLoading = true;

    this.arithmeticService.loadSettingsFromStorage().subscribe({
      next: (settings) => {
        console.log('[DEBUG] Session - loaded settings from storage:', JSON.stringify(settings));
        console.log('[DEBUG] Session - operations in loaded settings:', settings?.operations);
        if (!settings) {
          this.snackBar.open('Keine Einstellungen gefunden. Bitte konfigurieren Sie zuerst Ihre Trainingseinstellungen.', 'OK', {
            duration: 5000
          });
          this.router.navigate(['/mental-arithmetic/main']);
          return;
        }

        this.initializeSession(settings);
        this.startSession();
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.snackBar.open('Fehler beim Laden der Einstellungen', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/mental-arithmetic/main']);
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private initializeSession(settings: ArithmeticSettings): void {
    console.log('[DEBUG] Session - initializeSession called with operations:', settings.operations);
    this.sessionTimeLimit = settings.timeLimit ? settings.timeLimit * 60 * 1000 : null;
    this.timeRemaining = this.sessionTimeLimit || 0;
    this.timeElapsed = 0;

    this.arithmeticService.createSession(settings).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.startSession();
      },
      error: (error) => {
        console.error('Error creating session:', error);
        this.snackBar.open('Fehler beim Erstellen der Sitzung', 'OK', { duration: 3000 });
        this.router.navigate(['/mental-arithmetic/main']);
      }
    });
  }

  private startSession(): void {
    if (!this.currentSession) return;

    this.arithmeticService.startSession(this.currentSession.id).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.isSessionStarted = true;
        this.isSessionCompleted = false;
        this.isPaused = false;

        this.loadCurrentProblem();
        this.startTimer();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error starting session:', error);
      }
    });
  }

  private loadCurrentProblem(): void {
    if (!this.currentSession) return;

    this.currentProblem = this.arithmeticService.getCurrentProblem(this.currentSession);
    this.currentProblemStartTime = Date.now(); // Track when this problem starts
    this.answerForm.reset();
    this.showFeedback = false;
    this.cdr.detectChanges();
  }

  private startTimer(): void {
    this.clearTimer();

    const startTime = Date.now();

    this.timerInterval = setInterval(() => {
      if (!this.isPaused && this.currentSession) {
        this.timeElapsed = Date.now() - startTime;

        if (this.sessionTimeLimit) {
          this.timeRemaining = Math.max(0, this.sessionTimeLimit - this.timeElapsed);

          if (this.timeRemaining <= 0) {
            this.handleTimeOut();
            return;
          }
        }

        // Update problem time if current problem exists
        if (this.currentProblem && !this.currentProblem.answeredAt) {
          this.currentProblem.timeSpent = Date.now() - this.currentProblemStartTime;
        }

        this.cdr.detectChanges();
      }
    }, 100); // Update every 100ms for smooth countdown
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTimeOut(): void {
    this.clearTimer();
    if (this.currentSession) {
      this.currentSession.status = SessionStatus.TIMED_OUT;
      this.currentSession.isTimedOut = true;
      this.completeSession();
    }
  }

  onSubmitAnswer(): void {
    if (!this.answerForm.valid || !this.currentSession || !this.currentProblem) {
      return;
    }

    const userAnswer = parseInt(this.answerForm.get('userAnswer')?.value);
    this.lastAnswerCorrect = this.arithmeticService.checkAnswer(this.currentProblem, userAnswer);

    this.showFeedback = true;

    // Update problem with answer
    this.currentProblem.userAnswer = userAnswer;
    this.currentProblem.isCorrect = this.lastAnswerCorrect;
    this.currentProblem.answeredAt = new Date();

    // Disable form after submission
    this.answerForm.disable();

    // Update session via API
    this.arithmeticService.updateSession(this.currentSession).subscribe({
      next: (updatedSession) => {
        this.currentSession = updatedSession;
        this.cdr.detectChanges();

        // Auto-proceed after delay
        setTimeout(() => {
          this.proceedToNext();
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating session:', error);
      }
    });
  }

  private proceedToNext(): void {
    if (!this.currentSession) return;

    if (this.isLastProblem()) {
      this.completeSession();
    } else {
      this.moveToNextProblem();
    }
  }

  private isLastProblem(): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.currentProblemIndex >= this.currentSession.totalProblems - 1;
  }

  private moveToNextProblem(): void {
    if (!this.currentSession) return;

    this.currentSession.currentProblemIndex++;
    this.loadCurrentProblem();
    this.answerForm.enable();
    this.showFeedback = false;
  }

  private completeSession(): void {
    this.clearTimer();
    this.isSessionCompleted = true;

    if (this.currentSession) {
      this.arithmeticService.completeSession(this.currentSession.id).subscribe({
        next: (session) => {
          this.currentSession = session;
          this.cdr.detectChanges();

          // Show completion message
          const accuracy = this.currentSession?.accuracy || 0;
          const score = this.currentSession?.score || 0;

          this.snackBar.open(`Training abgeschlossen! Punkte: ${score}, Genauigkeit: ${accuracy.toFixed(1)}%`, 'OK', {
            duration: 5000
          });
        },
        error: (error) => {
          console.error('Error completing session:', error);
        }
      });
    }
  }

  pauseSession(): void {
    if (!this.currentSession || this.isPaused) return;

    this.isPaused = true;
    this.arithmeticService.pauseSession(this.currentSession.id).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error pausing session:', error);
      }
    });
  }

  resumeSession(): void {
    if (!this.currentSession || !this.isPaused) return;

    this.isPaused = false;
    this.arithmeticService.resumeSession(this.currentSession.id).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error resuming session:', error);
      }
    });
  }

  endSession(): void {
    const dialogRef = this.dialog.open(EndSessionDialogComponent, {
      panelClass: 'ui-dialog-pane',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'dialog',
      data: {
        currentScore: this.currentSession?.score || 0,
        problemsCompleted: this.currentSession?.problemsCompleted || 0,
        totalProblems: this.currentSession?.totalProblems || 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.clearTimer();
        if (this.currentSession) {
          this.currentSession.status = SessionStatus.CANCELLED;
          this.arithmeticService.updateSession(this.currentSession).subscribe({
            next: () => {
              this.router.navigate(['/mental-arithmetic/main']);
            },
            error: (error) => {
              console.error('Error ending session:', error);
              this.router.navigate(['/mental-arithmetic/main']);
            }
          });
        } else {
          this.router.navigate(['/mental-arithmetic/main']);
        }
      }
    });
  }

  skipProblem(): void {
    if (!this.currentSession || !this.currentProblem) return;

    // Mark as incorrect and skipped
    this.currentProblem.userAnswer = null;
    this.currentProblem.isCorrect = false;
    this.currentProblem.answeredAt = new Date();

    this.proceedToNext();
  }

  // UI Helper methods
  formatTime(milliseconds: number): string {
    return this.arithmeticService.formatTime(milliseconds);
  }

  formatDetailedTime(milliseconds: number): string {
    return this.arithmeticService.formatDetailedTime(milliseconds);
  }

  getSessionProgress(): number {
    if (!this.currentSession) return 0;
    return (this.currentSession.problemsCompleted / this.currentSession.totalProblems) * 100;
  }

  getProgressColor(): 'good' | 'medium' | 'low' {
    if (!this.currentSession) return 'good';
    if (this.currentSession.accuracy >= 80) return 'good';
    if (this.currentSession.accuracy >= 60) return 'medium';
    return 'low';
  }

  get answerInvalid(): boolean {
    const control = this.answerForm.get('userAnswer');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Getters for template
  get currentProblemDisplay(): string {
    if (!this.currentProblem) return '';
    return this.currentProblem.expression;
  }

  get remainingProblems(): number {
    if (!this.currentSession) return 0;
    return this.currentSession.totalProblems - this.currentSession.problemsCompleted;
  }

  get currentProblemNumber(): number {
    if (!this.currentSession) return 0;
    return this.currentSession.currentProblemIndex + 1;
  }

  get totalProblems(): number {
    return this.currentSession?.totalProblems || 0;
  }

  get currentScore(): number {
    return this.currentSession?.score || 0;
  }

  get currentAccuracy(): number {
    return this.currentSession?.accuracy || 0;
  }

  get isTimeRunningOut(): boolean {
    if (!this.sessionTimeLimit || this.timeRemaining <= 0) return false;
    return this.timeRemaining <= 60000; // Less than 1 minute remaining
  }

  // Keyboard shortcuts
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // Enter auf Buttons (z. B. "Fortsetzen" im Pause-Overlay) normal auslösen
      if (this.isPaused || event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      if (!this.answerForm.disabled) {
        this.onSubmitAnswer();
      }
    } else if (event.key === 'Escape') {
      this.pauseSession();
    }
  }

  // Number pad methods for mobile
  appendNumber(digit: string): void {
    if (this.answerForm.disabled) return;

    const currentValue = this.currentAnswerText();
    const newValue = currentValue + digit;

    // Handle leading zeros
    const cleanValue = newValue === '0' ? '0' : newValue.replace(/^0+/, '') || '0';

    this.setAnswerFromPad(cleanValue);
  }

  backspace(): void {
    if (this.answerForm.disabled) return;

    const currentValue = this.currentAnswerText();
    const newValue = currentValue.slice(0, -1);
    // Ein einzelnes "-" kann input[type=number] nicht darstellen
    this.setAnswerFromPad(newValue === '-' ? '' : newValue);
  }

  toggleNegative(): void {
    if (this.answerForm.disabled) return;

    const currentValue = this.currentAnswerText();
    if (currentValue.startsWith('-')) {
      this.setAnswerFromPad(currentValue.substring(1));
    } else if (currentValue !== '0' && currentValue !== '') {
      this.setAnswerFromPad('-' + currentValue);
    }
  }

  // input[type=number] liefert eine Zahl (oder null), der Ziffernblock arbeitet mit Text
  private currentAnswerText(): string {
    const value = this.answerForm.get('userAnswer')?.value;
    return value === null || value === undefined ? '' : String(value);
  }

  private setAnswerFromPad(value: string): void {
    const control = this.answerForm.get('userAnswer');
    control?.setValue(value);
    control?.markAsDirty();
  }

  // Navigation methods
  restartTraining(): void {
    this.router.navigate(['/mental-arithmetic/session']);
  }

  viewResults(): void {
    this.router.navigate(['/mental-arithmetic/arithmetic-list']);
  }

  goToMain(): void {
    this.router.navigate(['/mental-arithmetic']);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.currentSession && this.currentSession.status === SessionStatus.ACTIVE) {
      event.preventDefault();
      // Modern browsers ignore custom messages, but this shows the browser's default confirmation dialog
      event.returnValue = 'Möchten Sie die Sitzung wirklich verlassen? Ihr Fortschritt wird gespeichert.';
    }
  }
}

@Component({
  selector: 'app-end-session-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule
  ],
  template: `
    <div class="ui-dialog end-dialog">
      <h2 class="ui-dialog-title">Training beenden</h2>

      <p class="m-0">Möchten Sie die Trainingseinheit wirklich beenden?</p>

      @if (data) {
        <dl class="session-stats">
          <div><dt>Aktueller Punktestand</dt><dd>{{ data.currentScore }}</dd></div>
          <div><dt>Gelöste Aufgaben</dt><dd>{{ data.problemsCompleted }} / {{ data.totalProblems }}</dd></div>
        </dl>
      }

      <p class="hint">Ihr bisheriger Fortschritt wird gespeichert.</p>

      <div class="ui-dialog-actions">
        <button type="button" class="ui-btn ui-btn--rose" [mat-dialog-close]="'confirm'">
          <mat-icon aria-hidden="true">stop</mat-icon>
          Beenden
        </button>
        <button type="button" class="ui-btn ui-btn--green" mat-dialog-close>
          <mat-icon aria-hidden="true">play_arrow</mat-icon>
          Weitermachen
        </button>
      </div>
    </div>
    `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .end-dialog {
      max-width: 400px;
    }

    .session-stats {
      display: flex;
      flex-direction: column;
      gap: var(--ui-space-2);
      margin: var(--ui-space-4) 0 0;
      padding: var(--ui-space-3) var(--ui-space-4);
      background: var(--raised);
      border: 1px solid var(--border);
      border-radius: var(--ui-radius);
    }

    .session-stats div {
      display: flex;
      justify-content: space-between;
      gap: var(--ui-space-4);
    }

    .session-stats dd {
      margin: 0;
      color: var(--text);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .hint {
      margin: var(--ui-space-3) 0 0;
      color: var(--text-dim);
      font-size: var(--ui-text-sm);
    }

    .ui-btn mat-icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      font-size: 18px;
    }
  `]
})
export class EndSessionDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      currentScore: number;
      problemsCompleted: number;
      totalProblems: number;
    }
  ) {}
}
