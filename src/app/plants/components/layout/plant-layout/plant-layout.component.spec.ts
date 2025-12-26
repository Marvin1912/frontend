import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantLayoutComponent } from './plant-layout.component';

describe('PlantLayoutComponent', () => {
  let component: PlantLayoutComponent;
  let fixture: ComponentFixture<PlantLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
