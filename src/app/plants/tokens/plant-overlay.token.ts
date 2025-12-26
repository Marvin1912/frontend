import {InjectionToken} from '@angular/core';
import {Plant} from '../models/plant.model';

export const PLANT_DATA = new InjectionToken<Plant>('PLANT_DATA');
