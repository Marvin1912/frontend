import {MatDialogConfig} from '@angular/material/dialog';

/**
 * Shared MatDialog config for all nutrition dialogs: the dialog component renders
 * `ui-dialog` as its root, `ui-dialog-pane` neutralises the Material surface and
 * `nutrition-scope` applies the shared nutrition styles inside the overlay.
 */
export function nutritionDialogConfig<D>(data?: D, width?: string): MatDialogConfig<D> {
  return {
    data,
    width,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100dvh - 32px)',
    panelClass: ['ui-dialog-pane', 'nutrition-scope']
  };
}
