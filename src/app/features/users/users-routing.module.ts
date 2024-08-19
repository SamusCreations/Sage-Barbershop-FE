import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { TableComponent } from './table/table.component';
import { authGuard } from '../../shared/guards/auth.guard';
import { FormComponent } from './form/form.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path: 'users',
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
      { path: 'create', component: FormComponent },
      { path: 'detail/:id', component: DetailComponent },
      { path: 'update/:id', component: FormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
