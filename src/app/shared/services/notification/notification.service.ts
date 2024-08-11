import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
export enum messageType {
  error,
  info,
  success,
  warning,
}
@Injectable({
  providedIn: 'root',
})
//https://www.npmjs.com/package/ngx-toastr
export class NotificationService {
  options: IndividualConfig;
  constructor(private toastr: ToastrService, private router: Router) {
    this.options = this.toastr.toastrConfig;
    //https://www.npmjs.com/package/ngx-toastr#options
    //Habilitar formato HTML dentro de la notificación
    this.options.enableHtml = true;

    /* Top Right, Bottom Right, Bottom Left, Top Left, Top Full Width, Bottom Full Width, Top Center, Bottom Center */
    this.options.positionClass = 'toast-top-left';
    //Tiempo que se presenta el mensaje
    this.options.timeOut = 2500;
    this.options.disableTimeOut = false;
    this.options.closeButton = true;
    this.options.progressBar = true;
  }
  /*
Presentar mensaje de notificación
Toast Type: success, info, warning, error
 */
  public message(title: string, message: string, type: messageType) {
    this.toastr.show(
      message,
      title,
      this.options,
      'toast-' + messageType[type]
    );
  }
  public messageRedirect(
    title: string,
    message: string,
    type: messageType,
    url: string
  ) {
    this.toastr
      .show(message, title, this.options, 'toast-' + messageType[type])
      .onHidden.subscribe(() => this.router.navigateByUrl(url));
  }
}
