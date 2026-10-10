import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Plant } from '../../models/plant.model';

import { ImageUploadDialogComponent } from './image-upload-dialog.component';

describe('ImageUploadDialogComponent', () => {
  let component: ImageUploadDialogComponent;
  let fixture: ComponentFixture<ImageUploadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {id: 1, name: 'Monstera'} as Plant},
        {provide: MatDialogRef, useValue: {close: vi.fn()}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
