import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog.component';

export interface NotificationConfig extends MatSnackBarConfig {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  // Success notifications
  success(message: string, action: string = 'OK', duration: number = 3000): MatSnackBarRef<any> {
    const config: NotificationConfig = {
      duration,
      panelClass: ['notification-success'],
      action,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };

    return this.snackBar.open(message, action, config);
  }

  // Error notifications
  error(message: string, action: string = 'Schließen', duration: number = 5000): MatSnackBarRef<any> {
    const config: NotificationConfig = {
      duration,
      panelClass: ['notification-error'],
      action,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };

    return this.snackBar.open(message, action, config);
  }

  // Warning notifications
  warning(message: string, action: string = 'OK', duration: number = 4000): MatSnackBarRef<any> {
    const config: NotificationConfig = {
      duration,
      panelClass: ['notification-warning'],
      action,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };

    return this.snackBar.open(message, action, config);
  }

  // Info notifications
  info(message: string, action: string = 'OK', duration: number = 3000): MatSnackBarRef<any> {
    const config: NotificationConfig = {
      duration,
      panelClass: ['notification-info'],
      action,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };

    return this.snackBar.open(message, action, config);
  }

  // Confirmation dialog
  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data,
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    return dialogRef.afterClosed();
  }

  // Generic notification with type
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', action?: string): MatSnackBarRef<any> {
    switch (type) {
      case 'success':
        return this.success(message, action);
      case 'error':
        return this.error(message, action);
      case 'warning':
        return this.warning(message, action);
      default:
        return this.info(message, action);
    }
  }

  // Loading notification
  loading(message: string = 'Laden...'): MatSnackBarRef<any> {
    const config: NotificationConfig = {
      duration: 0, // Don't auto-dismiss
      panelClass: ['notification-loading'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };

    return this.snackBar.open(message, undefined, config);
  }

  // Dismiss specific snackbar
  dismiss(ref: MatSnackBarRef<any>): void {
    ref.dismiss();
  }

  // Dismiss all snackbars
  dismissAll(): void {
    this.snackBar.dismiss();
  }

  // Session-specific notifications
  sessionStarted(problemCount: number): void {
    this.success(`Training mit ${problemCount} Aufgaben gestartet!`);
  }

  sessionCompleted(score: number, accuracy: number): void {
    this.success(`Training abgeschlossen! Punktzahl: ${score}, Genauigkeit: ${accuracy.toFixed(1)}%`);
  }

  sessionPaused(): void {
    this.info('Training pausiert. Ihr Fortschritt wird gespeichert.');
  }

  sessionResumed(): void {
    this.info('Training fortgesetzt.');
  }

  sessionEnded(): void {
    this.warning('Training beendet. Ergebnisse wurden gespeichert.');
  }

  // Problem-specific notifications
  correctAnswer(): void {
    this.success('Richtig!', 'Weiter', 1500);
  }

  incorrectAnswer(correctAnswer: number): void {
    this.error(`Falsch! Die richtige Antwort ist ${correctAnswer}.`, 'Verstanden', 3000);
  }

  // Settings notifications
  settingsSaved(): void {
    this.success('Einstellungen gespeichert.');
  }

  settingsError(error: string): void {
    this.error(`Fehler beim Speichern: ${error}`);
  }

  // Storage notifications
  storageError(): void {
    this.error('Fehler beim Speichern der Daten. Bitte überprüfen Sie Ihren Browserspeicher.');
  }

  storageCleared(): void {
    this.info('Alle Daten wurden gelöscht.');
  }

  // Validation notifications
  validationError(message: string): void {
    this.warning(`Validierungsfehler: ${message}`);
  }

  // Network notifications
  networkError(): void {
    this.error('Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.');
  }

  // Timer notifications
  timerWarning(secondsRemaining: number): void {
    this.warning(`Nur noch ${secondsRemaining} Sekunden übrig!`);
  }

  timeUp(): void {
    this.error('Zeit abgelaufen!');
  }
}