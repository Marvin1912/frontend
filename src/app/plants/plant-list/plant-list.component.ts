import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {Plant} from '../model/plant';
import {PlantService} from '../plant-service/plant.service';
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
import {NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {CreateImageDialogComponent} from '../dialogs/create-image-dialog/create-image-dialog.component';
import {ShowImageDialogComponent} from '../dialogs/show-image-dialog/show-image-dialog.component';
import {Router} from '@angular/router';
import {DeletePlantDialogComponent} from '../dialogs/delete-plant-dialog/delete-plant-dialog.component';
import {ShowPlantDialogComponent} from '../dialogs/show-plant-dialog/show-plant-dialog.component';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {PLANT_DATA} from '../tokens/plant-overlay-token';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-plant-list',
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
    NgIf,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './plant-list.component.html',
  styleUrl: './plant-list.component.css'
})
export class PlantListComponent implements OnInit, OnDestroy {

  plants = new MatTableDataSource<Plant>();
  columnsToDisplay = ['name', 'species', 'image', 'delete'];
  hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  overlayRef: OverlayRef | null = null;

  constructor(
    private plantService: PlantService,
    private dialog: MatDialog,
    private router: Router,
    private overlay: Overlay,
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
    let matDialogRef = this.dialog.open(CreateImageDialogComponent, {
      width: '400px',
      data: plant
    });

    matDialogRef.afterClosed().subscribe((result: string | null) => {
      if (result) {
        let tmpPlant = {...plant, image: result};
        this.plantService.updatePlant(tmpPlant).subscribe({
          next: value => {
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
    let matDialogRef = this.dialog.open(DeletePlantDialogComponent, {
      data: {plant}
    });

    matDialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.plants.data = this.plants.data.filter(p => p.id !== plant.id);
      }
    });
  }

  createInjector(plant: Plant): Injector {
    return Injector.create({
      providers: [{provide: PLANT_DATA, useValue: plant}]
    });
  }

  openPlantDetailDialog(event: MouseEvent, plant: Plant) {

    const positionStrategy = this.overlay.position()
      .global()
      .left(`${event.clientX + 15}px`)
      .top(`${event.clientY}px`);

    this.hoverTimeout = setTimeout(() => {

      const overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition()
      });

      overlayRef.attach(new ComponentPortal(ShowPlantDialogComponent, null, this.createInjector(plant)));
      this.overlayRef = overlayRef;

    }, 500);
  }

  clearPlantDialog() {
    clearTimeout(this.hoverTimeout ?? 0);
    this.hoverTimeout = null;
    this.overlayRef?.detach();
  }

  closePlantDetailDialog() {
    this.clearPlantDialog();
  }

  ngOnDestroy(): void {
    this.clearPlantDialog();
  }
}
