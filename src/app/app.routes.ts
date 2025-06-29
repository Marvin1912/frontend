import {Routes} from '@angular/router';
import {PlantFormComponent} from './plants/plant-form/plant-form.component';
import {BackendComponent} from './backend/backend.component';
import {HomeComponent} from './home/home.component';
import {PlantListComponent} from './plants/plant-list/plant-list.component';
import {PlantMainComponent} from './plants/plant-main/plant-main.component';
import {PlantRootComponent} from './plants/plant-root/plant-root.component';
import {PlantEditComponent} from './plants/plant-edit/plant-edit.component';
import {PlantOverviewComponent} from './plants/plant-overview/plant-overview.component';
import {PlantDetailsComponent} from './plants/plant-details/plant-details.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'account', component: BackendComponent},
  {
    path: 'plant-root',
    component: PlantRootComponent,
    children: [
      {path: '', component: PlantMainComponent, data: {home: '/'}},
      {path: 'plant-form', component: PlantFormComponent, data: {home: '/plant-root'}},
      {path: 'plant-list', component: PlantListComponent, data: {home: '/plant-root'}},
      {path: 'plant-overview', component: PlantOverviewComponent, data: {home: '/plant-root'}},
      {path: 'plant-edit/:id', component: PlantEditComponent, data: {home: '/plant-root'}},
      {path: 'plant/:id', component: PlantDetailsComponent, data: {home: '/plant-root'}}
    ]
  }
];
