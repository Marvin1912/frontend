import {Component, OnInit} from '@angular/core';
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
export class PlantListComponent implements OnInit {

  plants = new MatTableDataSource<Plant>();
  columnsToDisplay = ['name', 'description', 'image']

  constructor(
    private plantService: PlantService,
    private dialog: MatDialog,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.plantService.getPlants().subscribe(plants => {
      this.plants.data = plants
    });
  }

  openCreateImageDialog(plant: Plant): void {
    this.dialog.open(CreateImageDialogComponent, {
      width: '250px',
      data: plant
    })
  }

  openImageDialog(plant: Plant) {
    const imageUrl = 'data:image/jpeg;base64,' + plant.image;

    this.dialog.open(ShowImageDialogComponent, {
      data: {imageUrl, name: plant.name}
    });
  }

  navigateToPlant(id: number) {
    void this.router.navigate(['/plant-root/plants', id]);
  }
}
