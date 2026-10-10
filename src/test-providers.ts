import {EnvironmentProviders, Provider, provideZoneChangeDetection} from '@angular/core';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {provideDateFnsAdapter} from '@angular/material-date-fns-adapter';
import {de} from 'date-fns/locale';

// Global providers for every TestBed (wired via the `providersFile` option of the
// unit-test builder). HTTP is always backed by HttpTestingController so no spec
// ever hits the real backend.
const testProviders: (Provider | EnvironmentProviders)[] = [
  provideZoneChangeDetection(),
  provideHttpClient(withXhr()),
  provideHttpClientTesting(),
  provideRouter([]),
  provideAnimationsAsync('noop'),
  provideDateFnsAdapter(),
  {provide: MAT_DATE_LOCALE, useValue: de},
];

export default testProviders;
