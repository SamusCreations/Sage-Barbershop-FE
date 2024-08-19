import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing.module';
import { TableComponent } from './table/table.component';
import { FormComponent } from './form/form.component';
import { DetailComponent } from './detail/detail.component';
import { IndexComponent } from './index/index.component';


@NgModule({
  declarations: [
    TableComponent,
    FormComponent,
    DetailComponent,
    IndexComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule
  ]
})
export class UsersModule { }
