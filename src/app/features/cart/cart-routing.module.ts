import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { OrderComponent } from './order/order.component';

const routes: Routes = [
  {
    path: 'cart',
    component: IndexComponent,
    children: [{ path: 'order', component: OrderComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRoutingModule {}
