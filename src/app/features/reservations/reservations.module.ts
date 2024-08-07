import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationsRoutingModule } from './reservations-routing.module';
import { ListComponent } from './list/list.component';
import { IndexComponent } from './index/index.component';
import { DetailComponent } from './detail/detail.component';
import { TableComponent } from './table/table.component';
import { FormComponent } from './form/form.component';


@NgModule({
  declarations: [
    ListComponent,
    IndexComponent,
    DetailComponent,
    TableComponent,
    FormComponent
  ],
  imports: [
    CommonModule,
    ReservationsRoutingModule
  ]
})
export class ReservationsModule { }
