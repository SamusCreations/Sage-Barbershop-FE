import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { TableComponent } from './table/table.component';
import { FormComponent } from './form/form.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [{
  path: 'schedules',
  component: IndexComponent,
  children: [
    { path: 'table', component: TableComponent },
    { path: 'create', component: FormComponent },
    { path: 'update/:id', component: FormComponent },
    { path: 'detail/:id', component: DetailComponent },
  ]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulesRoutingModule { }
