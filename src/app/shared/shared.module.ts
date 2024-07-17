import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from './httpService/http.service';
import { FileUploadService } from './fileUpload/file.upload.service';
import { NotificacionService } from './notification/notification.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [HttpService, FileUploadService, NotificacionService],
  exports: [CommonModule],
})
export class SharedModule {}
