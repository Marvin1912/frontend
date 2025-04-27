import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPlantDialogComponent } from './show-plant-dialog.component';

describe('ShowPlantDialogComponent', () => {
  let component: ShowPlantDialogComponent;
  let fixture: ComponentFixture<ShowPlantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowPlantDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowPlantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
