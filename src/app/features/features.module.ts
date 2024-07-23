import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ProductsModule } from './products/products.module';
import { ServicesModule } from './services/services.module';
import { BranchesModule } from './branches/branches.module';
import { ReservationsModule } from './reservations/reservations.module';

@NgModule({
  declarations: [],
  imports: [
    SharedModule, 
    CommonModule, 
    HomeModule, 
    AuthModule, 
    InvoicesModule,
    ProductsModule,
    ServicesModule,
    BranchesModule,
    ReservationsModule
  ],
})
export class FeaturesModule {}
