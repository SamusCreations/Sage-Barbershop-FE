import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/httpService/http.service';

@Injectable({
  providedIn: 'root'
})
export class CrudProductsService {
  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>('product/');
  }
  findById(id: number): Observable<any> {
    let urlSearchParams = new URLSearchParams()
    urlSearchParams.append("id", id.toString())
    return this.httpService.get<any>(`product`, urlSearchParams);
  }
}
