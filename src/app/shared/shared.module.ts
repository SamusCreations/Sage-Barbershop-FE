import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from './httpService/http.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    HttpService
  ],
  exports: [
    CommonModule,
  ]
})
export class SharedModule { }
