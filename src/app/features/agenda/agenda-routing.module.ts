import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { CalendarComponent } from './calendar/calendar.component';

const routes: Routes = [ {
  path: 'agenda',
  component: IndexComponent,
  children: [
    { path: 'calendar', component: CalendarComponent },
  ],
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgendaRoutingModule { }
