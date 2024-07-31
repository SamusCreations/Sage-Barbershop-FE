import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/httpService/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudProductsService {
  private endpoint = 'product'; 

  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>(this.endpoint);
  }

  findById(id: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    return this.httpService.get<any>(`${this.endpoint}/getById`, params);
  }

  create(productData: FormData): Observable<any> {
    return this.httpService.post<any>(this.endpoint, productData);
  }

  update(productData: FormData): Observable<any> {
    return this.httpService.put<any>(this.endpoint, productData);
  }

  delete(id: number): Observable<any> {
    return this.httpService.delete<any>(`${this.endpoint}/${id}`);
  }

  getAllCategories(): Observable<any> {
    return this.httpService.get<any>(`category/`);
  }
}
