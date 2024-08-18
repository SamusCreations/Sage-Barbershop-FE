import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CrudInvoicesService {
  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>('invoice-header/');
  }

  create(invoiceData: FormData): Observable<any> {
    return this.httpService.post<any>("invoice-header/", invoiceData);
  }
  update(invoiceData: FormData): Observable<any> {
    return this.httpService.put<any>("invoice-header/", invoiceData);
  }
  findByEmployee(id: number) : Observable<any> {
    let urlSearchParams = new URLSearchParams()
    urlSearchParams.append("administratorId", id.toString())
    return this.httpService.get<any>('invoice-header', urlSearchParams);
  }
  setAsInvoice(id: number) : Observable<any> {
    let formData = new FormData()
    formData.append("id", id.toString())
    return this.httpService.put<any>('invoice-header/status', formData);
  }
  findById(id: number): Observable<any> {
    let urlSearchParams = new URLSearchParams()
    urlSearchParams.append("id", id.toString())
    return this.httpService.get<any>(`invoice-header`, urlSearchParams);
  }

  getUsers(): Observable<any> {
    return this.httpService.get<any>(`user/`);
  }
}
