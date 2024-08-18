import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartRoutingModule } from './cart-routing.module';
import { IndexComponent } from './index/index.component';
import { OrderComponent } from './order/order.component';


@NgModule({
  declarations: [
    IndexComponent,
    OrderComponent
  ],
  imports: [
    CommonModule,
    CartRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CartModule { }
