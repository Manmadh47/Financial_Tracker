import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExportExcelComponent } from './ExportDocuments/export-excel/export-excel.component';
import { HomeComponent } from './home/home.component';
import { SummaryComponent } from '../app/summary/summary-page/summary.component';
import { GenerateForecastComponent } from './forecast/generate-forecast.component';
import { BillRatesComponent } from './bill-rates/bill-rates.component';
import { ManageListPageComponent } from '../app/manage-list/manage-list-page.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'excel', component: ExportExcelComponent },
   { path: 'summary', component: SummaryComponent },
   { path: 'list', component: ManageListPageComponent },
   { path: 'forecast', component: GenerateForecastComponent },
   { path: 'billRates', component: BillRatesComponent },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
