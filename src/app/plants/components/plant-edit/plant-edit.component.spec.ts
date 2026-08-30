import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlantEditComponent } from './plant-edit.component';
import { Plant } from '../../models/plant.model';
import { PlantLocation } from '../../models/plant-location.enum';

describe('PlantDetailComponent', () => {
  let component: PlantEditComponent;
  let fixture: ComponentFixture<PlantEditComponent>;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  const plant: Plant = {
    id: 1,
    name: 'Ficus',
    species: 'Ficus lyrata',
    description: '',
    careInstructions: '',
    location: PlantLocation.LIVING_ROOM,
    wateringFrequency: 7,
    lastWateredDate: '2024-01-01',
    nextWateredDate: null,
    image: 'old-image-uuid',
    fertilizingFrequency: null,
    lastFertilizedDate: null,
    nextFertilizedDate: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantEditComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantEditComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saveChanges', () => {

    beforeEach(() => {
      component.plant = {...plant};
      component.tempPlant = {...plant};
      component.tmpLastWatered = new Date('2024-02-01');
      component.tmpLastFertilized = null;
      component.isEditMode = true;
    });

    it('updates the plant without touching the image when no file was selected', () => {
      const snackBarSpy = spyOn(snackBar, 'open');

      component.saveChanges();

      expect(component.isEditMode).toBeFalse();

      const req = httpMock.expectOne(req => req.url.endsWith('/plants') && req.method === 'PUT');
      expect(req.request.body.lastWateredDate).toBe('2024-02-01');
      expect(req.request.body.image).toBe('old-image-uuid');
      req.flush({}, {status: 200, statusText: 'OK'});

      expect(component.plant?.lastWateredDate).toBe('2024-02-01');
      expect(snackBarSpy).toHaveBeenCalled();
      expect(snackBarSpy.calls.mostRecent().args[0]).toContain('updated');
    });

    it('uploads the selected image first and links it to the updated plant', () => {
      component.selectedFile = new File(['content'], 'plant.png', {type: 'image/png'});

      component.saveChanges();

      const imageReq = httpMock.expectOne(req => req.url.includes('/images'));
      imageReq.flush({}, {status: 201, statusText: 'Created', headers: {Location: '/images/new-image-uuid'}});

      const plantReq = httpMock.expectOne(req => req.url.endsWith('/plants') && req.method === 'PUT');
      expect(plantReq.request.body.image).toBe('new-image-uuid');
      plantReq.flush({}, {status: 200, statusText: 'OK'});

      expect(component.plant?.image).toBe('new-image-uuid');
      expect(component.imageUrl).toContain('new-image-uuid');
    });

    it('shows an error snackbar when the plant update fails', () => {
      const snackBarSpy = spyOn(snackBar, 'open');

      component.saveChanges();

      const req = httpMock.expectOne(req => req.url.endsWith('/plants') && req.method === 'PUT');
      req.flush('error', {status: 500, statusText: 'Server Error'});

      expect(snackBarSpy.calls.mostRecent().args[0]).toContain('Failed');
    });

    it('shows an error snackbar when the image upload fails', () => {
      const snackBarSpy = spyOn(snackBar, 'open');
      component.selectedFile = new File(['content'], 'plant.png', {type: 'image/png'});

      component.saveChanges();

      const imageReq = httpMock.expectOne(req => req.url.includes('/images'));
      imageReq.flush('error', {status: 500, statusText: 'Server Error'});

      expect(snackBarSpy.calls.mostRecent().args[0]).toContain('Failed to update image');
      httpMock.expectNone(req => req.url.endsWith('/plants') && req.method === 'PUT');
    });

    it('does nothing when there is no plant being edited', () => {
      component.tempPlant = null;

      component.saveChanges();

      httpMock.expectNone(req => req.url.endsWith('/plants') && req.method === 'PUT');
    });
  });
});
