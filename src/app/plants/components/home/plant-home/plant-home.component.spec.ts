import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantHomeComponent } from './plant-home.component';

describe('PlantHomeComponent', () => {
  let component: PlantHomeComponent;
  let fixture: ComponentFixture<PlantHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
