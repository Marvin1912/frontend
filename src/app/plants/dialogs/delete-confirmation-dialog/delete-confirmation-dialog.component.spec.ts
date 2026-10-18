import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Plant } from '../../models/plant.model';
import { PlantService } from '../../services/plant.service';

import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';

describe('DeleteConfirmationDialogComponent', () => {
  let component: DeleteConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteConfirmationDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let plantService: { deletePlant: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = {close: vi.fn()};
    plantService = {deletePlant: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [DeleteConfirmationDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {plant: {id: 1, name: 'Monstera'} as Plant}},
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: PlantService, useValue: plantService}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes with "deleted" only after the plant was deleted', () => {
    plantService.deletePlant.mockReturnValue(of(undefined));

    const deleteButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.ui-btn--rose')!;
    deleteButton.click();

    expect(plantService.deletePlant).toHaveBeenCalledWith(1);
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledWith('deleted');
  });

  it('stays open and shows an error when deleting fails', () => {
    plantService.deletePlant.mockReturnValue(throwError(() => new Error('boom')));

    component.deletePlant();
    fixture.detectChanges();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.deleting()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent).toContain('boom');
  });
});
