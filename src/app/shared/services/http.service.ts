import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: URLSearchParams): Observable<T> {
    const queryParams = params
      ? this.convertURLSearchParams(params)
      : undefined;
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: queryParams });
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
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
}
