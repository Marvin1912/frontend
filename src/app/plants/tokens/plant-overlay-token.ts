import {InjectionToken} from '@angular/core';
import {Plant} from '../model/plant';

export const PLANT_DATA = new InjectionToken<Plant>('PLANT_DATA');
