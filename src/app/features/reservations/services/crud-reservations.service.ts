import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/httpService/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CrudReservationsService {
  private endpoint = 'reservation';

  constructor(private httpService: HttpService) {}

  getAll(): Observable<any> {
    return this.httpService.get<any>(this.endpoint);
  }

  findById(id: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    return this.httpService.get<any>(`${this.endpoint}/getById`, params);
  }

  findByManager(id: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    return this.httpService.get<any>(`${this.endpoint}/getByManager`, params);
  }

  findByClient(name: string, idManager?: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('name', name.toString());
    params.append('idManager', idManager.toString());
    return this.httpService.get<any>(`${this.endpoint}/getByClient`, params);
  }

  findByMonthYear(
    month: number,
    year: number,
    idManager?: number
  ): Observable<any> {
    const params = new URLSearchParams();
    params.append('month', month.toString());
    params.append('year', year.toString());
    params.append('idManager', idManager.toString());
    return this.httpService.get<any>(`${this.endpoint}/getByMonthYear`, params);
  }

  create(data: FormData): Observable<any> {
    return this.httpService.post<any>(this.endpoint, data);
  }

  update(data: FormData): Observable<any> {
    return this.httpService.put<any>(this.endpoint, data);
  }

  getSchedules(): Observable<any> {
    return this.httpService.get<any>(`schedule`);
  }
}
