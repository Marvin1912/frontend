import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Set default values
    this.data.confirmText = this.data.confirmText || 'Bestätigen';
    this.data.cancelText = this.data.cancelText || 'Abbrechen';
    this.data.type = this.data.type || 'warning';

    // Set default icon based on type
    if (!this.data.icon) {
      switch (this.data.type) {
        case 'danger':
          this.data.icon = 'warning';
          break;
        case 'info':
          this.data.icon = 'info';
          break;
        default:
          this.data.icon = 'help';
      }
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get iconColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'info':
        return 'primary';
      default:
        return 'accent';
    }
  }

  get confirmButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  }
}