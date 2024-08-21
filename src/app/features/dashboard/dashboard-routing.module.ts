import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ReportsComponent } from './reports/reports.component';
import { authGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: IndexComponent,
    children: [
      {
        path: 'reports',
        component: ReportsComponent,
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
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
