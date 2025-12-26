import {Routes} from '@angular/router';
import {PlantCreateComponent} from './plants/components/create/plant-create/plant-create.component';
import {BackendComponent} from './backend/backend.component';
import {HomeComponent} from './home/home.component';
import {PlantTableComponent} from './plants/components/management/plant-table/plant-table.component';
import {PlantHomeComponent} from './plants/components/home/plant-home/plant-home.component';
import {PlantLayoutComponent} from './plants/components/layout/plant-layout/plant-layout.component';
import {PlantEditComponent} from './plants/components/edit/plant-edit/plant-edit.component';
import {PlantGalleryComponent} from './plants/components/gallery/plant-gallery/plant-gallery.component';
import {PlantViewComponent} from './plants/components/view/plant-view/plant-view.component';
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
    component: PlantLayoutComponent,
    children: [
      {path: '', component: PlantHomeComponent, data: {home: '/'}},
      {path: 'plant-form', component: PlantCreateComponent, data: {home: '/plant-root'}},
      {path: 'plant-list', component: PlantTableComponent, data: {home: '/plant-root'}},
      {path: 'plant-overview', component: PlantGalleryComponent, data: {home: '/plant-root'}},
      {path: 'plant-edit/:id', component: PlantEditComponent, data: {home: '/plant-root'}},
      {path: 'plant/:id', component: PlantViewComponent, data: {home: '/plant-root'}}
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
