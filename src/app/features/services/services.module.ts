import { SharedModule } from '../../shared/shared.module'

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ServicesRoutingModule } from './services-routing.module';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { CoreModule } from '../../core/core.module';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';


@NgModule({
  declarations: [
    IndexComponent,
    ListComponent,
    DetailComponent,
    FormComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    SharedModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ServicesModule { }
