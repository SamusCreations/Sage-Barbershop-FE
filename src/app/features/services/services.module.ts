import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing.module';
import { DetailComponent } from './detail/detail.component';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';


@NgModule({
  declarations: [
    DetailComponent,
    IndexComponent,
    ListComponent,
    FormComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule
  ]
})
export class ServicesModule { }
