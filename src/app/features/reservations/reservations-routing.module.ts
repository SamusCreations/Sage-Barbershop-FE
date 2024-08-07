import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { TableComponent } from './table/table.component';

const routes: Routes = [{
  path: 'reservations',
  component: IndexComponent,
  children: [
    { path: 'list', component: ListComponent },
    { path: 'table', component: TableComponent },
    { path: 'detail/:id', component: DetailComponent }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
