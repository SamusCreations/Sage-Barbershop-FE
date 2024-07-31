import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Usando una función de fábrica para crear el error
  }

  get<T>(endpoint: string, params?: URLSearchParams): Observable<T> {
    const queryParams = params
      ? this.convertURLSearchParams(params)
      : undefined;
      console.log(`${this.baseUrl}/${endpoint}/${queryParams}`);
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { params: queryParams })
      .pipe(catchError(this.handleError));
  }

  private convertURLSearchParams(params: URLSearchParams): HttpParams {
    let httpParams = new HttpParams();

    params.forEach((value: string | string[], key: string) => {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          httpParams = httpParams.append(key, val);
        });
      } else {
        httpParams = httpParams.append(key, value);
      }
    });

    return httpParams;
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }
}
