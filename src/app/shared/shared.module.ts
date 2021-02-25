
import { NgModule } from '@angular/core';
import { MaterialModule } from "./material/material.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import { SummaryCalculations } from './models/summary_calculations';
import { UploadService } from './services/upload.service';
import { SummaryService } from './services/summary.service';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
    MaterialModule
  ],
  exports: [FormsModule,ReactiveFormsModule,MaterialModule,FlexLayoutModule],
  providers:[SummaryCalculations,UploadService,SummaryService,DatePipe]
})
export class SharedModule { }
