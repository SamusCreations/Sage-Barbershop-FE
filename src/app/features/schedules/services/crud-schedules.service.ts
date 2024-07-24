import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/httpService/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudSchedulesService {
  private endpoint = 'schedule'; 

  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>(this.endpoint);
  }

  findById(id: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    return this.httpService.get<any>(`${this.endpoint}/getById`, params);
  }

  findByBranch(id: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('branchId', id.toString());
    return this.httpService.get<any>(`${this.endpoint}/getByBranch`, params);
  }

  create(scheduleData: FormData): Observable<any> {
    return this.httpService.post<any>(this.endpoint, scheduleData);
  }

  update(scheduleData: FormData): Observable<any> {
    return this.httpService.put<any>(this.endpoint, scheduleData);
  }

  getBranches(): Observable<any> {
    return this.httpService.get<any>(`branch`);
  }

}
