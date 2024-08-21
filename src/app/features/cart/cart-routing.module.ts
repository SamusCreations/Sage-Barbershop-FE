import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { OrderComponent } from './order/order.component';
import { authGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'orders',
    component: IndexComponent,
    children: [
      {
        path: 'cart',
        component: OrderComponent,
        canActivate: [authGuard],
        data: {
          roles: ['CLIENT', 'EMPLOYEE', 'ADMIN'],
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRoutingModule {}
