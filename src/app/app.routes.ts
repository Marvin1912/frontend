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
import {AddWordComponent} from './vocabulary/components/add-word/add-word.component';
import {VocabularyListComponent} from './vocabulary/components/vocabulary-list/vocabulary-list.component';
import {VocabularyHomeComponent} from './vocabulary/components/vocabulary-home/vocabulary-home.component';
import {MentalArithmeticRootComponent} from './mental-arithmetic/mental-arithmetic-root/mental-arithmetic-root.component';
import {MentalArithmeticMainComponent} from './mental-arithmetic/mental-arithmetic-main/mental-arithmetic-main.component';
import {ArithmeticSettingsComponent} from './mental-arithmetic/components/arithmetic-settings/arithmetic-settings.component';
import {ArithmeticSessionComponent} from './mental-arithmetic/components/arithmetic-session/arithmetic-session.component';
import {ArithmeticListComponent} from './mental-arithmetic/components/arithmetic-list/arithmetic-list.component';
import {InfluxdbBuckets} from './influxdb-buckets/influxdb-buckets';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'account', component: BackendComponent},
  {path: 'influxdb-buckets', component: InfluxdbBuckets},
  {
    path: 'vocabulary',
    component: VocabularyHomeComponent,
    children: [
      {path: 'add', component: AddWordComponent},
      {path: 'add/:id', component: AddWordComponent},
      {path: 'list', component: VocabularyListComponent}
    ]
  },
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
  },
  {
    path: 'mental-arithmetic',
    component: MentalArithmeticRootComponent,
    children: [
      {path: '', component: MentalArithmeticMainComponent, data: {home: '/'}},
      {path: 'main', component: MentalArithmeticMainComponent, data: {home: '/mental-arithmetic'}},
      {path: 'settings', component: ArithmeticSettingsComponent, data: {home: '/mental-arithmetic'}},
      {path: 'session', component: ArithmeticSessionComponent, data: {home: '/mental-arithmetic'}},
      {path: 'arithmetic-list', component: ArithmeticListComponent, data: {home: '/mental-arithmetic'}}
    ]
  }
];
