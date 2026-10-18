import {Component, OnInit, signal, WritableSignal, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {ArithmeticSession} from '../../model/arithmetic-session';
import {Difficulty, OperationType} from '../../model/arithmetic-enums';
import {ArithmeticService} from '../../services/arithmetic.service';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-arithmetic-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltip
  ],
  templateUrl: './arithmetic-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./arithmetic-list.component.css']
})
export class ArithmeticListComponent implements OnInit {
  private static readonly DIFFICULTY_ORDER: Record<Difficulty, number> = {
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 1,
    [Difficulty.HARD]: 2
  };

  sessions: ArithmeticSession[] = [];
  filteredSessions: ArithmeticSession[] = [];
  readonly sortableColumns: { key: string; label: string; sortable: boolean }[] = [
    {key: 'date', label: 'Datum', sortable: true},
    {key: 'difficulty', label: 'Schwierigkeit', sortable: true},
    {key: 'operations', label: 'Operationen', sortable: false},
    {key: 'score', label: 'Punktzahl', sortable: true},
    {key: 'accuracy', label: 'Genauigkeit', sortable: true},
    {key: 'duration', label: 'Dauer', sortable: true}
  ];

  // Statistics
  totalSessions: number = 0;
  totalProblems: number = 0;
  totalProblemsCompleted: number = 0;
  averageScore: number = 0;
  averageAccuracy: number = 0;
  totalPracticeTime: number = 0;
  stats: { label: string; value: string; icon: string }[] = [];

  // Filtering and sorting
  selectedDifficulty: string = 'all';
  selectedOperation: string = 'all';
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // UI state
  loading: WritableSignal<boolean> = signal(true);
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
    this.loading.set(true);
    this.arithmeticService.loadSessionsFromStorage().subscribe({
      next: (sessions) => {
        this.sessions = sessions.map(s => ({
          ...s,
          createdAt: s.createdAt ? new Date(s.createdAt as any) : new Date(),
          startTime: s.startTime ? new Date(s.startTime as any) : null,
          endTime: s.endTime ? new Date(s.endTime as any) : null
        }));
        this.filteredSessions = [...this.sessions];
        this.calculateStatistics();
        this.applyFiltersAndSorting();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.snackBar.open('Fehler beim Laden der Sitzungen', 'OK', {duration: 3000});
        this.calculateStatistics();
        this.loading.set(false);
      }
    });
  }

  calculateStatistics(): void {
    this.totalSessions = this.sessions.length;

    if (this.sessions.length === 0) {
      this.totalProblems = 0;
      this.totalProblemsCompleted = 0;
      this.averageScore = 0;
      this.averageAccuracy = 0;
      this.totalPracticeTime = 0;
      this.updateStats();
      return;
    }

    this.totalProblems = this.sessions.reduce((sum, session) => sum + session.totalProblems, 0);

    this.totalProblemsCompleted = this.sessions.reduce((sum, session) => sum + session.problemsCompleted, 0);

    this.averageScore = this.sessions.reduce((sum, session) => sum + session.score, 0);

    const totalAccuracy = this.sessions.reduce((sum, session) => sum + session.accuracy, 0);
    this.averageAccuracy = Math.round(totalAccuracy / this.sessions.length);

    this.totalPracticeTime = this.sessions.reduce((sum, session) => sum + session.totalTimeSpent, 0);
    this.updateStats();
  }

  private updateStats(): void {
    this.stats = [
      {label: 'Sitzungen', value: `${this.totalSessions}`, icon: 'history'},
      {label: 'Aufgaben', value: `${this.totalProblemsCompleted}`, icon: 'calculate'},
      {label: 'Punktzahl', value: `${this.averageScore}/${this.totalProblems}`, icon: 'trending_up'},
      {label: 'Ø\u00a0Genauigkeit', value: `${this.averageAccuracy}%`, icon: 'target'},
      {label: 'Trainingszeit', value: this.formatTime(this.totalPracticeTime), icon: 'schedule'}
    ];
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
        case 'difficulty':
          comparison = this.difficultyRank(b) - this.difficultyRank(a);
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
    if (this.expandedSession) {
      // Details stehen unter der Tabelle: nach dem Rendern in den sichtbaren Bereich holen
      setTimeout(() => document.getElementById('ma-session-details')
        ?.scrollIntoView({behavior: 'smooth', block: 'start'}));
    }
  }

  private difficultyRank(session: ArithmeticSession): number {
    return ArithmeticListComponent.DIFFICULTY_ORDER[session.settings.difficulty] ?? -1;
  }

  deleteSession(sessionId: string): void {
    if (confirm('Möchten Sie diese Sitzung wirklich löschen?')) {
      this.arithmeticService.deleteSessionFromStorage(sessionId).subscribe({
        next: () => {
          this.loadSessions();
          this.snackBar.open('Sitzung gelöscht', 'OK', {duration: 3000});
        },
        error: (error) => {
          console.error('Error deleting session:', error);
          this.snackBar.open('Fehler beim Löschen der Sitzung', 'OK', {duration: 3000});
        }
      });
    }
  }

  clearAllSessions(): void {
    if (confirm('Möchten Sie wirklich alle Sitzungen löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.')) {
      this.arithmeticService.clearAllSessionsFromStorage().subscribe({
        next: () => {
          this.loadSessions();
          this.snackBar.open('Alle Sitzungen gelöscht', 'OK', {duration: 3000});
        },
        error: (error) => {
          console.error('Error clearing sessions:', error);
          this.snackBar.open('Fehler beim Löschen der Sitzungen', 'OK', {duration: 3000});
        }
      });
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

  get expandedSessionData(): ArithmeticSession | null {
    // Nur sichtbare Sitzungen: ein weggefilterter Eintrag schließt die Details
    return this.filteredSessions.find(s => s.id === this.expandedSession) ?? null;
  }

  difficultyLabel(session: ArithmeticSession): string {
    switch (session.settings.difficulty) {
      case Difficulty.EASY: return 'Einfach';
      case Difficulty.MEDIUM: return 'Mittel';
      default: return 'Schwer';
    }
  }

  difficultyPalette(session: ArithmeticSession): 'green' | 'amber' | 'rose' {
    switch (session.settings.difficulty) {
      case Difficulty.EASY: return 'green';
      case Difficulty.MEDIUM: return 'amber';
      default: return 'rose';
    }
  }

  // score ist die Anzahl richtiger Antworten, daher Einfärbung über die Genauigkeit
  accuracyLevel(session: ArithmeticSession): 'high' | 'medium' | 'low' {
    if (session.accuracy >= 80) return 'high';
    if (session.accuracy >= 60) return 'medium';
    return 'low';
  }

  getSessionOperationsDisplay(session: ArithmeticSession): string[] {
    return session.settings.operations.map(op =>
      op === OperationType.ADDITION ? 'Addition' : 'Subtraktion'
    );
  }
}
