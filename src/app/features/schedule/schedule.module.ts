import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { IndexComponent } from './index/index.component';
import { TableComponent } from './table/table.component';


@NgModule({
  declarations: [
    IndexComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleModule { }
