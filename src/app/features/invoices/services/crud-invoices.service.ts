import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/httpService/http.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CrudInvoicesService {
  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>('invoice-header/');
  }
  findById(id: number): Observable<any> {
    let urlSearchParams = new URLSearchParams()
    urlSearchParams.append("id", id.toString())
    return this.httpService.get<any>(`invoice-header`, urlSearchParams);
  }
}
