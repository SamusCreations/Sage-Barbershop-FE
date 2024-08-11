import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  NotificationService,
  messageType,
} from '../services/notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorInterceptorService implements HttpInterceptor {
  // Remember to provide this service in AppModule
  constructor(private noti: NotificationService) {}
  
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Capture the error
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let message: string = null;
        if (error.error instanceof ErrorEvent) {
          console.log('Client-Side Error');
          message = `Error: ${error.error.message}`;
        } else {
          console.log('Server-Side Error');
          message = `Code: ${error.status},  Message: ${error.message}`;
          console.log(message);
          // HTTP status codes with their respective messages
          switch (error.status) {
            case 0:
              message = 'Unknown Error';
              break;
            case 400:
              message = 'Bad Request';
              break;
            case 401:
              message = 'Unauthorized';
              break;
            case 403:
              message = 'Forbidden';
              break;
            case 404:
              message = 'Not Found';
              break;
            case 422:
              message = 'Unprocessable Entity';
              break;
            case 500:
              message = 'Internal Server Error';
              break;
            case 503:
              message = 'Service Unavailable';
              break;
          }
        }

        // Show an error message
        this.noti.message('Error ' + error.status, message, messageType.error);
        throw new Error(error.message);
      })
    );
  }
}
