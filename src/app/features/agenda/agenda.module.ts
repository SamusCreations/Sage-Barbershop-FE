import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgendaRoutingModule } from './agenda-routing.module';
import { IndexComponent } from './index/index.component';
import { CalendarComponent } from './calendar/calendar.component';

import { FullCalendarModule } from '@fullcalendar/angular';


@NgModule({
  declarations: [
    IndexComponent,
    CalendarComponent
  ],
  imports: [
    CommonModule,
    AgendaRoutingModule,
    FullCalendarModule
  ]
})
export class AgendaModule { }
