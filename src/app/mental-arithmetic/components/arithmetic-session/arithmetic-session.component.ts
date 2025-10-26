import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ActivatedRoute, Router } from '@angular/router';

import { ArithmeticSession } from '../../model/arithmetic-session';
import { ArithmeticProblem } from '../../model/arithmetic-problem';
import { ArithmeticSettings } from '../../model/arithmetic-settings';
import { SessionStatus } from '../../model/arithmetic-enums';
import { ArithmeticService } from '../../services/arithmetic.service';

@Component({
  selector: 'app-arithmetic-session',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './arithmetic-session.component.html',
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

  // UI state
  isPaused: boolean = false;
  showFeedback: boolean = false;
  lastAnswerCorrect: boolean = false;
  isSessionCompleted: boolean = false;
  isSessionStarted: boolean = false;

  // Loading state
  isLoading: boolean = false;

  constructor(
    private arithmeticService: ArithmeticService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettingsAndStartSession();
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

    try {
      const settings = this.arithmeticService.loadSettingsFromStorage();
      if (!settings) {
        this.snackBar.open('Keine Einstellungen gefunden. Bitte konfigurieren Sie zuerst Ihre Trainingseinstellungen.', 'OK', {
          duration: 5000
        });
        this.router.navigate(['/mental-arithmetic/main']);
        return;
      }

      this.initializeSession(settings);
      this.startSession();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.snackBar.open('Fehler beim Laden der Einstellungen', 'OK', {
        duration: 3000
      });
      this.router.navigate(['/mental-arithmetic/main']);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private initializeSession(settings: ArithmeticSettings): void {
    this.currentSession = this.arithmeticService.createSession(settings);
    this.sessionTimeLimit = settings.timeLimit ? settings.timeLimit * 60 * 1000 : null; // Convert to milliseconds
    this.timeRemaining = this.sessionTimeLimit || 0;
    this.timeElapsed = 0;
  }

  private startSession(): void {
    if (!this.currentSession) return;

    this.currentSession = this.arithmeticService.startSession(this.currentSession);
    this.isSessionStarted = true;
    this.isSessionCompleted = false;
    this.isPaused = false;

    this.loadCurrentProblem();
    this.startTimer();
    this.cdr.detectChanges();
  }

  private loadCurrentProblem(): void {
    if (!this.currentSession) return;

    this.currentProblem = this.arithmeticService.getCurrentProblem(this.currentSession);
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
        if (this.currentProblem && this.currentProblem.answeredAt === null) {
          this.currentProblem.timeSpent = this.timeElapsed - this.getSessionStartTime();
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

  private getSessionStartTime(): number {
    return this.currentSession?.startTime?.getTime() || 0;
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

    // Update session
    this.currentSession = this.arithmeticService.updateSession(this.currentSession);

    // Disable form after submission
    this.answerForm.disable();
    this.cdr.detectChanges();

    // Auto-proceed after delay
    setTimeout(() => {
      this.proceedToNext();
    }, 2000);
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
      this.currentSession = this.arithmeticService.completeSession(this.currentSession);
    }

    this.cdr.detectChanges();

    // Show completion message
    const accuracy = this.currentSession?.accuracy || 0;
    const score = this.currentSession?.score || 0;

    this.snackBar.open(`Training abgeschlossen! Punkte: ${score}, Genauigkeit: ${accuracy.toFixed(1)}%`, 'OK', {
      duration: 5000
    });
  }

  pauseSession(): void {
    if (!this.currentSession || this.isPaused) return;

    this.isPaused = true;
    this.currentSession = this.arithmeticService.pauseSession(this.currentSession);
    this.cdr.detectChanges();
  }

  resumeSession(): void {
    if (!this.currentSession || !this.isPaused) return;

    this.isPaused = false;
    this.currentSession = this.arithmeticService.resumeSession(this.currentSession);
    this.cdr.detectChanges();
  }

  endSession(): void {
    const dialogRef = this.dialog.open(EndSessionDialogComponent, {
      width: '350px',
      panelClass: 'end-session-dialog',
      backdropClass: 'dialog-backdrop',
      disableClose: false,
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
          this.arithmeticService.updateSession(this.currentSession);
        }
        this.router.navigate(['/mental-arithmetic/main']);
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

  getProgressColor(): string {
    if (!this.currentSession) return 'primary';
    if (this.currentSession.accuracy >= 80) return 'primary';
    if (this.currentSession.accuracy >= 60) return 'accent';
    return 'warn';
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

    const currentValue = this.answerForm.get('userAnswer')?.value || '';
    const newValue = currentValue + digit;

    // Handle leading zeros
    const cleanValue = newValue === '0' ? '0' : newValue.replace(/^0+/, '') || '0';

    this.answerForm.get('userAnswer')?.setValue(cleanValue);
  }

  backspace(): void {
    if (this.answerForm.disabled) return;

    const currentValue = this.answerForm.get('userAnswer')?.value || '';
    const newValue = currentValue.slice(0, -1);
    this.answerForm.get('userAnswer')?.setValue(newValue || '');
  }

  toggleNegative(): void {
    if (this.answerForm.disabled) return;

    const currentValue = this.answerForm.get('userAnswer')?.value || '';
    if (currentValue.startsWith('-')) {
      this.answerForm.get('userAnswer')?.setValue(currentValue.substring(1));
    } else if (currentValue !== '0' && currentValue !== '') {
      this.answerForm.get('userAnswer')?.setValue('-' + currentValue);
    }
  }

  // Navigation methods
  restartTraining(): void {
    this.router.navigate(['/mental-arithmetic/settings']);
  }

  viewResults(): void {
    this.router.navigate(['/mental-arithmetic/mental-arithmetic-main']);
  }

  goToMain(): void {
    this.router.navigate(['/mental-arithmetic']);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.currentSession && this.currentSession.status === SessionStatus.ACTIVE) {
      event.preventDefault();
      // Modern browsers ignore custom messages, but this shows the browser's default confirmation dialog
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      event.returnValue = 'Möchten Sie die Sitzung wirklich verlassen? Ihr Fortschritt wird gespeichert.';
    }
  }
}

@Component({
  selector: 'app-end-session-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Training beenden</h2>

      <mat-dialog-content>
        <p>Möchten Sie die Trainingseinheit wirklich beenden?</p>

        <div class="session-stats" *ngIf="data">
          <p><strong>Aktueller Punktestand:</strong> {{ data.currentScore }}</p>
          <p><strong>Gelöste Aufgaben:</strong> {{ data.problemsCompleted }} / {{ data.totalProblems }}</p>
        </div>

        <p class="warning-text">Ihr bisheriger Fortschritt wird gespeichert.</p>
      </mat-dialog-content>

      <mat-dialog-actions align="center">
        <button mat-button
                (click)="dialogRef.close('confirm')"
                class="confirm-button">
          <mat-icon>check_circle</mat-icon>
          Beenden
        </button>
        <button mat-button
                (click)="dialogRef.close()"
                class="cancel-button">
          <mat-icon>close</mat-icon>
          Weitermachen
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      text-align: center;
      min-width: 300px;
    }

    h2 {
      color: #1976d2;
      margin-bottom: 20px;
    }

    .session-stats {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      text-align: left;
    }

    .session-stats p {
      margin: 8px 0;
      color: #333;
    }

    .warning-text {
      color: #666;
      font-style: italic;
      margin: 15px 0;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
    }

    .confirm-button {
      background-color: #f44336;
      color: white;
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .confirm-button:hover {
      background-color: #d32f2f;
    }

    .cancel-button {
      background-color: #4caf50;
      color: white;
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cancel-button:hover {
      background-color: #388e3c;
    }

    mat-icon {
      width: 20px;
      height: 20px;
    }
  `]
})
export class EndSessionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EndSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentScore: number;
      problemsCompleted: number;
      totalProblems: number;
    }
  ) {}
}