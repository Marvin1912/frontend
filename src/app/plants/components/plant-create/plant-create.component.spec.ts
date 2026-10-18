import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { PlantCreateComponent } from './plant-create.component';
import { PlantService } from '../../services/plant.service';

describe('PlantCreateComponent', () => {
  let component: PlantCreateComponent;
  let fixture: ComponentFixture<PlantCreateComponent>;
  let plantService: { createPlant: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    plantService = {createPlant: vi.fn()};
    await TestBed.configureTestingModule({
      imports: [PlantCreateComponent],
      providers: [{provide: PlantService, useValue: plantService}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stays on the step and marks fields as touched when the step is invalid', () => {
    component.next();

    expect(component.step()).toBe(0);
    expect(component.isInvalid(component.basicInfoForm, 'name')).toBe(true);
  });

  it('advances only when the previous steps are valid', () => {
    expect(component.canGoTo(1)).toBe(false);

    component.basicInfoForm.setValue({name: 'Ficus', species: 'Ficus lyrata', description: 'Tree'});
    component.next();

    expect(component.step()).toBe(1);
    expect(component.canGoTo(2)).toBe(false);

    component.goTo(3);
    expect(component.step()).toBe(1);

    component.back();
    expect(component.step()).toBe(0);
  });

  it('defaults the last watered date to today in yyyy-MM-dd', () => {
    expect(component.careForm.value.lastWateredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('submits the plant from the image step via ngSubmit', () => {
    plantService.createPlant.mockReturnValue(of(new HttpResponse({headers: new HttpHeaders({Location: '/view/7'})})));
    component.basicInfoForm.setValue({name: 'Ficus', species: 'Ficus lyrata', description: 'Tree'});
    component.locationForm.setValue({location: 'KITCHEN'});
    component.careForm.patchValue({wateringFrequency: 7, careInstructions: 'Water'});
    component.step.set(3);
    fixture.detectChanges();

    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    const event = new Event('submit', {cancelable: true});
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(plantService.createPlant).toHaveBeenCalledTimes(1);
    expect(plantService.createPlant.mock.lastCall?.[0].name).toBe('Ficus');
  });
});
