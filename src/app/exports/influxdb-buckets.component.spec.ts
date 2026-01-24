import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfluxdbBucketsComponent } from './influxdb-buckets.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('InfluxdbBucketsComponent', () => {
  let component: InfluxdbBucketsComponent;
  let fixture: ComponentFixture<InfluxdbBucketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InfluxdbBucketsComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfluxdbBucketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
