import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantRootComponent } from './plant-root.component';

describe('PlantRootComponent', () => {
  let component: PlantRootComponent;
  let fixture: ComponentFixture<PlantRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantRootComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
