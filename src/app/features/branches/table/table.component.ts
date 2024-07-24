import { Component, OnInit } from '@angular/core';
import { CrudBranchesService } from '../services/crud-branches.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {

  branches: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;

  constructor(
    private CrudService: CrudBranchesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  async fetchServices(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.branches = data;
        this.chargingSuccesfully = true;
      },
      error: (error) => {
        this.chargingSuccesfully = false;
        console.error('Error al obtener datos de facturas', error);
      },
      complete: () => {
        this.charging = false;
        console.log('Fetch invoices complete');
      },
    };

    this.CrudService.getAll().subscribe(observer);
  }

  update(id: number): void {
    this.router.navigate(['/branches/update', id]);
  }

  detail(id: number): void {
    this.router.navigate(['/branches/detail', id]);
  }

  delete(id: number): void {
    this.router.navigate(['/branches/delete', id]);
  }

  create(): void {
    this.router.navigate(['/branches/create']);
  }
}
