import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImageViewDialogComponent } from './image-view-dialog.component';

describe('ImageViewDialogComponent', () => {
  let component: ImageViewDialogComponent;
  let fixture: ComponentFixture<ImageViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageViewDialogComponent],
      providers: [{provide: MAT_DIALOG_DATA, useValue: {imageUrl: 'image.png', name: 'Monstera'}}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
