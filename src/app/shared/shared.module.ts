import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from './services/httpService/http.service';
import { NotificationService } from './services/notification/notification.service';
import { SearchModalComponent } from './components/search-modal/search-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SearchModalComponent
  ],
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule],
  providers: [HttpService, NotificationService],
  exports: [CommonModule, SearchModalComponent],
})
export class SharedModule {}
