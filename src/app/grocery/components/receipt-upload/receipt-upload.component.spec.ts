import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NgZone} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {HttpTestingController} from '@angular/common/http/testing';
import {Observable} from 'rxjs';

import {ReceiptUploadComponent} from './receipt-upload.component';
import {ReceiptService} from '../../services/receipt.service';
import {environment} from '../../../../environments/environment';

registerLocaleData(localeDe);

declare const Zone: {root: {run<T>(fn: () => T): T}};

describe('ReceiptUploadComponent', () => {
  let component: ReceiptUploadComponent;
  let fixture: ComponentFixture<ReceiptUploadComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // jsdom has no camera; keep getUserMedia pending so the capture step stays untouched.
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {getUserMedia: () => new Promise(() => undefined)}
    });
    await TestBed.configureTestingModule({imports: [ReceiptUploadComponent]}).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReceiptUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    httpMock.verify();
  });

  it('runs the upload of a camera capture inside the Angular zone', () => {
    // Native canvas.toBlob is not patched by zone.js, so its callback fires in the root zone.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({drawImage: vi.fn()} as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(cb => Zone.root.run(() => cb(new Blob(['x'], {type: 'image/jpeg'}))));
    (component as unknown as {video: Partial<HTMLVideoElement>}).video = {videoWidth: 10, videoHeight: 10};

    let uploadedInZone: boolean | undefined;
    vi.spyOn(TestBed.inject(ReceiptService), 'uploadReceipt').mockImplementation(() => {
      uploadedInZone = NgZone.isInAngularZone();
      return new Observable();
    });

    component.capture();

    expect(uploadedInZone).toBe(true);
    expect(component.step).toBe('processing');
  });

  it('shows the review step once the receipt items are loaded', () => {
    vi.spyOn(TestBed.inject(ReceiptService), 'uploadReceipt').mockReturnValue(
      new Observable(sub => {
        sub.next({headers: {get: () => '/receipts/abc'}} as never);
        sub.complete();
      })
    );
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', {value: [new File(['x'], 'bon.jpg')]});

    component.onGallerySelected({target: input} as unknown as Event);
    httpMock.expectOne(`${environment.apiUrl}/receipts/abc/items`)
      .flush([{id: '1', name: 'Milch', singlePrice: 1.19, quantity: 1, price: 1.19}]);
    fixture.detectChanges();

    expect(component.step).toBe('review');
    expect(fixture.nativeElement.textContent).toContain('Positionen');
  });
});
