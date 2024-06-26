import { SharedModule } from '../../shared/shared.module'

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { IndexComponent } from './index/index.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { CoreModule } from '../../core/core.module';


@NgModule({
  declarations: [
    IndexComponent,
    ListComponent,
    DetailComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    SharedModule,
    CoreModule
  ]
})
export class ProductsModule { }
