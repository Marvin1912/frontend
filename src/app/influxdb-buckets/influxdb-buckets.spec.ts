import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluxdbBuckets } from './influxdb-buckets';

describe('InfluxdbBuckets', () => {
  let component: InfluxdbBuckets;
  let fixture: ComponentFixture<InfluxdbBuckets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfluxdbBuckets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfluxdbBuckets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
