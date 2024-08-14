import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  NotificationService,
  messageType,
} from '../services/notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorInterceptorService implements HttpInterceptor {
  constructor(private noti: NotificationService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          message = `Client Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 0:
              message = 'Unknown Error: ';
              break;
            case 400:
              message = 'Bad Request: ';
              break;
            case 401:
              message = 'Unauthorized: ';
              break;
            case 403:
              message = 'Forbidden: ';
              break;
            case 404:
              message = 'Not Found: ';
              break;
            case 422:
              message = 'Unprocessable Entity: ';
              break;
            case 500:
              message = 'Internal Server Error: ';
              break;
            case 503:
              message = 'Service Unavailable: ';
              break;
            default:
              message = `Server Error: Code ${error.status}`;
              break;
          }
          
          // Si el backend envía un mensaje de error específico, lo agregamos al mensaje
          if (error.error && error.error.error) {
            message += error.error.error;
          } else if (error.message) {
            message += error.message;
          }
        }

        // Mostrar un mensaje de error usando NotificationService
        this.noti.message(`Error ${error.status}`, message, messageType.error);
        
        return throwError(() => new Error(message));
      })
    );
  }
}
