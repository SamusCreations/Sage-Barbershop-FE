import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { FormComponent } from './form/form.component';
import { authGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'invoices',
    component: IndexComponent,
    children: [
      {
        path: 'list',
        component: ListComponent,
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
      {
        path: 'update/:id',
        component: FormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['EMPLOYEE', 'ADMIN'],
        },
      },
      {
        path: 'detail/:id',
        component: DetailComponent,
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
export class InvoicesRoutingModule {}
