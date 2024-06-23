import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/httpService/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudReservationsService {
  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>('reservation/');
  }
  findById(id: number): Observable<any> {
    let urlSearchParams = new URLSearchParams()
    urlSearchParams.append("id", id.toString())
    return this.httpService.get<any>(`reservation`, urlSearchParams);
  }
}
