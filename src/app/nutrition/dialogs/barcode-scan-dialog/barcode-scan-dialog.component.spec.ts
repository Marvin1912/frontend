import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';

import {BarcodeScanDialogComponent} from './barcode-scan-dialog.component';
import {NutritionService} from '../../services/nutrition.service';
import {FoodDraft} from '../../models/nutrition.model';

const draft: FoodDraft = {
  name: 'New York Style Pizza',
  brand: 'GUSTAVO GUSTO',
  kcalPer100: 230.97,
  proteinPer100: 11,
  carbsPer100: 26,
  fatPer100: 8.9,
  fiberPer100: 1.9,
  servingG: 465
};

describe('BarcodeScanDialogComponent', () => {
  let component: BarcodeScanDialogComponent;
  let fixture: ComponentFixture<BarcodeScanDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let nutritionService: { getFoodByBarcode: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = {close: vi.fn()};
    nutritionService = {getFoodByBarcode: vi.fn().mockReturnValue(of(draft))};

    await TestBed.configureTestingModule({
      imports: [BarcodeScanDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: NutritionService, useValue: nutritionService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeScanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  let submitEvent: Event;

  function submit(ean: string): HTMLElement {
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('#barcode-ean')!;
    input.value = ean;
    input.dispatchEvent(new Event('input'));
    submitEvent = new Event('submit', {cancelable: true});
    el.querySelector('form')!.dispatchEvent(submitEvent);
    fixture.detectChanges();
    return el;
  }

  it('looks up a typed barcode on submit instead of submitting the page', () => {
    const el = submit('4260414153068');

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(nutritionService.getFoodByBarcode).toHaveBeenCalledWith('4260414153068');
    expect(component.foundFood).toEqual(draft);
    expect(el.textContent).toContain('Gefunden: New York Style Pizza');
  });

  it('does not look up an invalid barcode', () => {
    submit('123');
    expect(nutritionService.getFoodByBarcode).not.toHaveBeenCalled();
  });

  it('shows a message when the barcode is unknown', () => {
    nutritionService.getFoodByBarcode.mockReturnValue(throwError(() => ({status: 404})));
    const el = submit('4260414153068');
    expect(el.textContent).toContain('Kein Treffer für 4260414153068.');
  });
});
