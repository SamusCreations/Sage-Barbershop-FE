import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { InvoicesModule } from './invoices/invoices.module';

@NgModule({
  declarations: [],
  imports: [
    SharedModule, 
    CommonModule, 
    HomeModule, 
    AuthModule, 
    InvoicesModule
  ],
})
export class FeaturesModule {}
