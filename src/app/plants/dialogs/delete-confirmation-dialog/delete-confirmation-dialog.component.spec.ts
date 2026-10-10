import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Plant } from '../../models/plant.model';

import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';

describe('DeleteConfirmationDialogComponent', () => {
  let component: DeleteConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteConfirmationDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {plant: {id: 1, name: 'Monstera'} as Plant}},
        {provide: MatDialogRef, useValue: {close: vi.fn()}}
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
});
