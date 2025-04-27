import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantMainComponent } from './plant-main.component';

describe('PlantMainComponent', () => {
  let component: PlantMainComponent;
  let fixture: ComponentFixture<PlantMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
