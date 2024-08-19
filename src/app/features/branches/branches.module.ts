import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchesRoutingModule } from './branches-routing.module';
import { TableComponent } from './table/table.component';
import { DetailComponent } from './detail/detail.component';
import { FormComponent } from './form/form.component';
import { IndexComponent } from './index/index.component';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';


@NgModule({
  declarations: [
    TableComponent,
    DetailComponent,
    FormComponent,
    IndexComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    BranchesRoutingModule,
  ],
  exports: [
    ListComponent
  ],
})
export class BranchesModule { }
