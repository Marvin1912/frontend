import {Component, OnDestroy, OnInit} from '@angular/core';
import {Plant} from '../../../models/plant.model';
import {PlantService} from '../../../services/plant.service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {CreateImageDialogComponent} from '../../../dialogs/create-image-dialog/create-image-dialog.component';
import {ShowImageDialogComponent} from '../../../dialogs/show-image-dialog/show-image-dialog.component';
import {Router} from '@angular/router';
import {DeletePlantDialogComponent} from '../../../dialogs/delete-plant-dialog/delete-plant-dialog.component';
import {ShowPlantDialogComponent} from '../../../dialogs/show-plant-dialog/show-plant-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-plant-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIcon,
    MatIconButton,
    ShowPlantDialogComponent
  ],
  templateUrl: './plant-table.component.html',
  styleUrl: './plant-table.component.css'
})
export class PlantTableComponent implements OnInit, OnDestroy {

  plants = new MatTableDataSource<Plant>();
  columnsToDisplay = ['name', 'species', 'image', 'delete'];

  // Preview popup properties
  previewVisible = false;
  currentPreviewPlant: Plant | null = null;
  previewPosition = { x: 0, y: 0 };
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
    this.plantService.getPlants().subscribe(plants => {
      this.plants.data = plants.sort((a, b) => a.id - b.id);
    });
  }

  openCreateImageDialog(plant: Plant): void {
    const matDialogRef = this.dialog.open(CreateImageDialogComponent, {
      width: '400px',
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
            plant.image = null;
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

    this.dialog.open(ShowImageDialogComponent, {
      data: {imageUrl, name: plant.name}
    });
  }

  navigateToPlant(id: number) {
    void this.router.navigate(['/plant-root/plant-edit', id]);
  }

  openDeletePlantDialog(plant: Plant) {
    const matDialogRef = this.dialog.open(DeletePlantDialogComponent, {
      data: {plant}
    });

    matDialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.plants.data = this.plants.data.filter(p => p.id !== plant.id);
      }
    });
  }

  // Simplified preview methods
  showPlantPreview(plant: Plant, event: MouseEvent): void {
    clearTimeout(this.hoverTimeout ?? 0);
    clearTimeout(this.hideTimeout ?? 0);

    this.hoverTimeout = setTimeout(() => {
      this.currentPreviewPlant = plant;
      this.previewVisible = true;

      // Position the preview near the mouse
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        const rect = tableContainer.getBoundingClientRect();
        this.previewPosition = {
          x: Math.min(event.clientX - rect.left + 15, rect.width - 270), // 270px is the popup width
          y: Math.min(event.clientY - rect.top, window.innerHeight - 300) // 300px is popup height with margin
        };
      }
    }, 300); // Reduced timeout for better UX
  }

  hidePlantPreview(): void {
    clearTimeout(this.hoverTimeout ?? 0);
    clearTimeout(this.hideTimeout ?? 0);

    // Add a small delay before hiding to allow moving mouse to preview
    this.hideTimeout = setTimeout(() => {
      this.previewVisible = false;
      this.currentPreviewPlant = null;
    }, 200);
  }

  keepPreviewVisible(): void {
    // Keep preview visible when hovering over it
    clearTimeout(this.hideTimeout ?? 0);
  }

  ngOnDestroy(): void {
    this.hidePlantPreview();
  }
}
