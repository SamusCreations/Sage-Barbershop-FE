import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { TableComponent } from './table/table.component';

const routes: Routes = [{
  path: 'schedule',
  component: IndexComponent,
  children: [
    { path: 'table', component: TableComponent },
  ]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }
