import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { IndexComponent } from './index/index.component';
import { TableComponent } from './table/table.component';
import { SchedulesRoutingModule } from './schedules-routing.module';
import { DetailComponent } from './detail/detail.component';
import { FormComponent } from './form/form.component';


@NgModule({
  declarations: [
    TableComponent,
    IndexComponent,
    DetailComponent,
    FormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    SchedulesRoutingModule,
  ]
})
export class SchedulesModule { }
