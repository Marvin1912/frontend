import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, signal, viewChild} from '@angular/core';
import {Plant} from '../../models/plant.model';
import {PlantService} from '../../services/plant.service';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {ImageUploadDialogComponent} from '../../dialogs/image-upload-dialog/image-upload-dialog.component';
import {ImageViewDialogComponent} from '../../dialogs/image-view-dialog/image-view-dialog.component';
import {Router} from '@angular/router';
import {DeleteConfirmationDialogComponent} from '../../dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import {PlantPreviewComponent} from '../../dialogs/plant-preview/plant-preview.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../../environments/environment';

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 220;

@Component({
  selector: 'app-plant-table',
  imports: [
    MatIcon,
    MatProgressSpinner,
    PlantPreviewComponent
  ],
  templateUrl: './plant-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './plant-table.component.css'
})
export class PlantTableComponent implements OnInit, OnDestroy {

  plants = signal<Plant[]>([]);
  loadState = signal<'loading' | 'loaded' | 'error'>('loading');

  private tableWrap = viewChild<ElementRef<HTMLElement>>('tableWrap');

  // Preview popup properties
  previewVisible = signal(false);
  currentPreviewPlant = signal<Plant | null>(null);
  previewPosition = signal({x: 0, y: 0});
  hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private plantService: PlantService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.loadPlants();
  }

  loadPlants(): void {
    this.plantService.getPlants().subscribe({
      next: plants => {
        this.plants.set([...plants].sort((a, b) => a.id - b.id));
        this.loadState.set('loaded');
      },
      error: () => this.loadState.set('error')
    });
  }

  openCreateImageDialog(plant: Plant): void {
    const matDialogRef = this.dialog.open(ImageUploadDialogComponent, {
      width: '400px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ui-dialog-pane',
      data: plant
    });

    matDialogRef.afterClosed().subscribe((result: string | null) => {
      if (result) {
        const tmpPlant = {...plant, image: result};
        this.plantService.updatePlant(tmpPlant).subscribe({
          next: () => {
            this.snackBar.open(`Plant updated!`, 'Dismiss', {
              duration: 5000
            })
            this.loadPlants();
          },
          error: err => {
            this.snackBar.open(`Plant update failed: ${err}`, 'Dismiss', {
              duration: 5000
            })
          }
        })
      }
    })
  }

  openImageDialog(plant: Plant) {
    const imageUrl = `${environment.apiUrl}/images/${plant.image}`

    this.dialog.open(ImageViewDialogComponent, {
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ui-dialog-pane',
      data: {imageUrl, name: plant.name}
    });
  }

  navigateToPlant(id: number) {
    void this.router.navigate(['/plant-root/edit', id]);
  }

  openDeletePlantDialog(plant: Plant) {
    const matDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ui-dialog-pane',
      data: {plant}
    });

    matDialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.plants.update(plants => plants.filter(p => p.id !== plant.id));
      }
    });
  }

  // Simplified preview methods
  showPlantPreview(plant: Plant, event: MouseEvent): void {
    clearTimeout(this.hoverTimeout ?? 0);
    clearTimeout(this.hideTimeout ?? 0);

    this.hoverTimeout = setTimeout(() => {
      this.currentPreviewPlant.set(plant);
      this.previewVisible.set(true);

      // Position the preview near the mouse, relative to the wrapper
      const wrap = this.tableWrap()?.nativeElement;
      if (wrap) {
        const rect = wrap.getBoundingClientRect();
        this.previewPosition.set({
          x: Math.max(0, Math.min(event.clientX - rect.left + 15, rect.width - PREVIEW_WIDTH)),
          y: Math.max(0, Math.min(event.clientY - rect.top, window.innerHeight - rect.top - PREVIEW_HEIGHT - 16))
        });
      }
    }, 300);
  }

  hidePlantPreview(): void {
    clearTimeout(this.hoverTimeout ?? 0);
    clearTimeout(this.hideTimeout ?? 0);

    // Add a small delay before hiding to allow moving mouse to preview
    this.hideTimeout = setTimeout(() => {
      this.previewVisible.set(false);
      this.currentPreviewPlant.set(null);
    }, 200);
  }

  keepPreviewVisible(): void {
    // Keep preview visible when hovering over it
    clearTimeout(this.hideTimeout ?? 0);
  }

  ngOnDestroy(): void {
    clearTimeout(this.hoverTimeout ?? 0);
    clearTimeout(this.hideTimeout ?? 0);
  }
}
