import {MatDialogConfig} from '@angular/material/dialog';

/**
 * Shared MatDialog config for all grocery dialogs: the dialog component renders
 * `ui-dialog` as its root, `ui-dialog-pane` neutralises the Material surface and
 * `grocery-scope` applies the shared grocery styles inside the overlay.
 */
export function groceryDialogConfig<D>(data?: D, width = '400px'): MatDialogConfig<D> {
  return {
    data,
    width,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100dvh - 32px)',
    panelClass: ['ui-dialog-pane', 'grocery-scope']
  };
}
