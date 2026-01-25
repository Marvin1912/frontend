import {Routes} from '@angular/router';
import {PlantCreateComponent} from './plants/components/plant-create/plant-create.component';
import {BackendComponent} from './backend/backend.component';
import {HomeComponent} from './home/home.component';
import {PlantTableComponent} from './plants/components/plant-table/plant-table.component';
import {PlantHomeComponent} from './plants/components/plant-home/plant-home.component';
import {PlantLayoutComponent} from './plants/components/plant-layout/plant-layout.component';
import {PlantEditComponent} from './plants/components/plant-edit/plant-edit.component';
import {PlantGalleryComponent} from './plants/components/plant-gallery/plant-gallery.component';
import {PlantViewComponent} from './plants/components/plant-view/plant-view.component';
import {AddWordComponent} from './vocabulary/components/add-word/add-word.component';
import {VocabularyListComponent} from './vocabulary/components/vocabulary-list/vocabulary-list.component';
import {VocabularyHomeComponent} from './vocabulary/components/vocabulary-home/vocabulary-home.component';
import {MentalArithmeticRootComponent} from './mental-arithmetic/components/arithmetic-root/mental-arithmetic-root.component';
import {MentalArithmeticMainComponent} from './mental-arithmetic/components/arithmetic-main/mental-arithmetic-main.component';
import {ArithmeticSettingsComponent} from './mental-arithmetic/components/arithmetic-settings/arithmetic-settings.component';
import {ArithmeticSessionComponent} from './mental-arithmetic/components/arithmetic-session/arithmetic-session.component';
import {ArithmeticListComponent} from './mental-arithmetic/components/arithmetic-list/arithmetic-list.component';
import {ExportsComponent} from './exports/exports.component';
import {InfluxdbBucketsComponent} from './exports/influxdb-buckets.component';
import {ExportsFilesComponent} from './exports/exports-files.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'account', component: BackendComponent},
  {
    path: 'exports',
    children: [
      {path: '', component: ExportsComponent},
      {path: 'influxdb', component: InfluxdbBucketsComponent},
      {path: 'files', component: ExportsFilesComponent}
    ]
  },
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
      {path: 'create', component: PlantCreateComponent, data: {home: '/plant-root'}},
      {path: 'management', component: PlantTableComponent, data: {home: '/plant-root'}},
      {path: 'gallery', component: PlantGalleryComponent, data: {home: '/plant-root'}},
      {path: 'edit/:id', component: PlantEditComponent, data: {home: '/plant-root'}},
      {path: 'view/:id', component: PlantViewComponent, data: {home: '/plant-root'}}
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
