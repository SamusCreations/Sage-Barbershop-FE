import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudBranchesService {
  private endpoint = 'branch'; 

  constructor(private httpService: HttpService) { }

  getAll(): Observable<any> {
    return this.httpService.get<any>(this.endpoint);
  }

  findById(id: number): Observable<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    return this.httpService.get<any>(`${this.endpoint}/getById`, params);
  }

  create(branchData: FormData): Observable<any> {
    return this.httpService.post<any>(this.endpoint, branchData);
  }

  update(branchData: FormData): Observable<any> {
    return this.httpService.put<any>(this.endpoint, branchData);
  }

  delete(id: number): Observable<any> {
    return this.httpService.delete<any>(`${this.endpoint}/${id}`);
  }

  getEmployeesWhithoutBranch(): Observable<any> {
    return this.httpService.get<any>(`user/EmployeesWithoutBranch/`);
  }
}
