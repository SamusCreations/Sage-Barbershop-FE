import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { TableComponent } from './table/table.component';
import { FormComponent } from './form/form.component';
import { authGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'services',
    component: IndexComponent,
    children: [
      { path: 'list', component: ListComponent },
      {
        path: 'table',
        component: TableComponent,
        canActivate: [authGuard],
        data: {
          roles: ['EMPLOYEE', 'ADMIN'],
        },
      },
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesRoutingModule {}
