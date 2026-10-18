import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';

import {BackendComponent} from './backend.component';
import {environment} from '../../environments/environment';

describe('BackendComponent', () => {
  let component: BackendComponent;
  let fixture: ComponentFixture<BackendComponent>;
  let http: HttpTestingController;
  const file = new File(['<xml/>'], 'camt.xml');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackendComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackendComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the empty state before an upload', () => {
    expect(fixture.nativeElement.querySelector('.ui-empty')?.textContent).toContain('Noch kein Kontoauszug analysiert');
  });

  it('does not upload without a file', () => {
    component.uploadFile();
    http.expectNone(`${environment.apiUrl}/camt-entries`);
  });

  it('stores the analysed bookings and clears the busy state', () => {
    component.uploadedFile.set(file);
    component.uploadFile();
    expect(component.busy()).toBe('upload');

    const req = http.expectOne(`${environment.apiUrl}/camt-entries`);
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({bookingsPerMonth: []});

    expect(component.busy()).toBeNull();
    expect(component.responseData()).toEqual({bookingsPerMonth: []});
  });

  it('drops the previous analysis when a new upload fails', () => {
    component.responseData.set({bookingsPerMonth: []});
    component.uploadedFile.set(file);
    component.uploadFile();
    http.expectOne(`${environment.apiUrl}/camt-entries`).flush('boom', {status: 500, statusText: 'Error'});

    expect(component.responseData()).toBeUndefined();
    expect(component.status()?.kind).toBe('danger');
  });

  it('copes with a response without months', () => {
    component.responseData.set({} as never);
    expect(component.hasBookings()).toBe(false);
  });

  it('reports an import error as danger alert', () => {
    component.importFile.set(file);
    component.importAndSaveFile();
    http.expectOne(`${environment.apiUrl}/camt-entries/import`).flush('boom', {status: 500, statusText: 'Error'});

    expect(component.status()?.kind).toBe('danger');
    expect(component.busy()).toBeNull();
  });

  it('ignores further actions while a request is running', () => {
    component.backupCostData();
    component.backupCostData();
    http.expectOne(`${environment.apiUrl}/export/costs`).flush(null);
    expect(component.status()?.kind).toBe('info');
  });
});
