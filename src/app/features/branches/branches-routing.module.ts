import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { FormComponent } from './form/form.component';
import { DetailComponent } from './detail/detail.component';
import { IndexComponent } from './index/index.component';

const routes: Routes = [
  {
    path: 'branches',
    component: IndexComponent,
    children: [
      { path: 'table', component: TableComponent },
      { path: 'create', component: FormComponent },
      { path: 'detail/:id', component: DetailComponent },
      { path: 'update/:id', component: FormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchesRoutingModule {}
