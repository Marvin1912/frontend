import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {ArithmeticSession} from '../../model/arithmetic-session';
import {OperationType} from '../../model/arithmetic-enums';
import {ArithmeticService} from '../../services/arithmetic.service';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-arithmetic-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltip
  ],
  templateUrl: './arithmetic-list.component.html',
  styleUrls: ['./arithmetic-list.component.css']
})
export class ArithmeticListComponent implements OnInit {
  sessions: ArithmeticSession[] = [];
  filteredSessions: ArithmeticSession[] = [];
  displayedColumns: string[] = ['date', 'difficulty', 'operations', 'score', 'accuracy', 'duration', 'actions'];

  // Statistics
  totalSessions: number = 0;
  totalProblemsCompleted: number = 0;
  averageScore: number = 0;
  averageAccuracy: number = 0;
  totalPracticeTime: number = 0;

  // Filtering and sorting
  selectedDifficulty: string = 'all';
  selectedOperation: string = 'all';
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // UI state
  loading: boolean = true;
  expandedSession: string | null = null;

  constructor(
    private arithmeticService: ArithmeticService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    try {
      this.sessions = this.arithmeticService.loadSessionsFromStorage();
      this.filteredSessions = [...this.sessions];
      this.calculateStatistics();
      this.applyFiltersAndSorting();
      this.loading = false;
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.snackBar.open('Fehler beim Laden der Sitzungen', 'OK', {duration: 3000});
      this.loading = false;
    }
  }

  calculateStatistics(): void {
    this.totalSessions = this.sessions.length;

    if (this.sessions.length === 0) {
      this.totalProblemsCompleted = 0;
      this.averageScore = 0;
      this.averageAccuracy = 0;
      this.totalPracticeTime = 0;
      return;
    }

    this.totalProblemsCompleted = this.sessions.reduce((sum, session) => sum + session.problemsCompleted, 0);

    const totalScore = this.sessions.reduce((sum, session) => sum + (session.score / session.totalProblems * 100), 0);
    this.averageScore = Math.round(totalScore / this.sessions.length);

    const totalAccuracy = this.sessions.reduce((sum, session) => sum + session.accuracy, 0);
    this.averageAccuracy = Math.round(totalAccuracy / this.sessions.length);

    this.totalPracticeTime = this.sessions.reduce((sum, session) => sum + session.totalTimeSpent, 0);
  }

  applyFiltersAndSorting(): void {
    // Apply filters
    this.filteredSessions = this.sessions.filter(session => {
      if (this.selectedDifficulty !== 'all' && session.settings.difficulty !== this.selectedDifficulty) {
        return false;
      }

      if (this.selectedOperation !== 'all') {
        if (!session.settings.operations.includes(this.selectedOperation as OperationType)) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    this.filteredSessions.sort((a, b) => {
      let comparison: number;

      switch (this.sortBy) {
        case 'date':
          const timeA = a.startTime ? a.startTime.getTime() : 0;
          const timeB = b.startTime ? b.startTime.getTime() : 0;
          comparison = timeB - timeA;
          break;
        case 'score':
          comparison = b.score - a.score;
          break;
        case 'accuracy':
          comparison = b.accuracy - a.accuracy;
          break;
        case 'duration':
          comparison = b.totalTimeSpent - a.totalTimeSpent;
          break;
        default:
          const timeA2 = a.startTime ? a.startTime.getTime() : 0;
          const timeB2 = b.startTime ? b.startTime.getTime() : 0;
          comparison = timeB2 - timeA2;
      }

      return this.sortOrder === 'asc' ? -comparison : comparison;
    });
  }

  onFilterChange(): void {
    this.applyFiltersAndSorting();
  }

  onSortChange(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'desc';
    }
    this.applyFiltersAndSorting();
  }

  toggleSessionExpansion(sessionId: string): void {
    this.expandedSession = this.expandedSession === sessionId ? null : sessionId;
  }

  deleteSession(sessionId: string): void {
    if (confirm('Möchten Sie diese Sitzung wirklich löschen?')) {
      try {
        this.arithmeticService.deleteSessionFromStorage(sessionId);
        this.loadSessions();
        this.snackBar.open('Sitzung gelöscht', 'OK', {duration: 3000});
      } catch (error) {
        console.error('Error deleting session:', error);
        this.snackBar.open('Fehler beim Löschen der Sitzung', 'OK', {duration: 3000});
      }
    }
  }

  clearAllSessions(): void {
    if (confirm('Möchten Sie wirklich alle Sitzungen löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.')) {
      try {
        this.arithmeticService.clearAllSessionsFromStorage();
        this.loadSessions();
        this.snackBar.open('Alle Sitzungen gelöscht', 'OK', {duration: 3000});
      } catch (error) {
        console.error('Error clearing sessions:', error);
        this.snackBar.open('Fehler beim Löschen der Sitzungen', 'OK', {duration: 3000});
      }
    }
  }

  exportSessions(format: 'json' | 'csv'): void {
    try {
      const data = this.filteredSessions;
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `arithmetic-sessions-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format
        const headers = ['Datum', 'Schwierigkeit', 'Operationen', 'Punktzahl', 'Genauigkeit', 'Dauer', 'Anzahl Probleme'];
        const rows = data.map(session => [
          session.startTime ? session.startTime.toLocaleDateString('de-DE') : '',
          session.settings.difficulty,
          session.settings.operations.join(', '),
          session.score.toString(),
          `${session.accuracy}%`,
          this.arithmeticService.formatTime(session.totalTimeSpent),
          session.problemsCompleted.toString()
        ]);

        content = [headers, ...rows].map(row => row.join(';')).join('\n');
        filename = `arithmetic-sessions-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      }

      const blob = new Blob([content], {type: mimeType});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.snackBar.open(`Sitzungen als ${format.toUpperCase()} exportiert`, 'OK', {duration: 3000});
    } catch (error) {
      console.error('Error exporting sessions:', error);
      this.snackBar.open('Fehler beim Exportieren der Sitzungen', 'OK', {duration: 3000});
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('de-DE');
  }

  formatTime(milliseconds: number): string {
    return this.arithmeticService.formatTime(milliseconds);
  }

  getSessionOperations(session: ArithmeticSession): OperationType[] {
    return session.settings.operations;
  }

  getSessionAccuracy(session: ArithmeticSession): number {
    return session.accuracy;
  }

  getSessionDuration(session: ArithmeticSession): number {
    return session.totalTimeSpent;
  }

  getSessionOperationsDisplay(session: ArithmeticSession): string[] {
    return session.settings.operations.map(op =>
      op === OperationType.ADDITION ? 'Addition' : 'Subtraktion'
    );
  }
}
