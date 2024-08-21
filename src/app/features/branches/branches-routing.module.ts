import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { FormComponent } from './form/form.component';
import { DetailComponent } from './detail/detail.component';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { authGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'branches',
    component: IndexComponent,
    children: [
      {
        path: 'table',
        component: TableComponent,
        canActivate: [authGuard],
        data: {
          roles: ['EMPLOYEE', 'ADMIN'],
        },
      },
      { path: 'list', component: ListComponent },
      {
        path: 'create',
        component: FormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['EMPLOYEE', 'ADMIN'],
        },
      },
      { path: 'detail/:id', component: DetailComponent },
      {
        path: 'update/:id',
        component: FormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['EMPLOYEE', 'ADMIN'],
        },
      },
    ],
  },
  {
    path: 'stores',
    component: IndexComponent,
    children: [{ path: 'list', component: ListComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchesRoutingModule {}
