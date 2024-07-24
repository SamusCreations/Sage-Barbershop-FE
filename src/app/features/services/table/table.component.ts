import { Component, OnInit } from '@angular/core';
import { CrudServicesService } from '../services/crud-services.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {

  services: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;

  selectedRows: number[] = [];
  open: boolean = false;

  constructor(
    private CrudServicesService: CrudServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  async fetchServices(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.services = data;
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

    this.CrudServicesService.getAll().subscribe(observer);
  }

  update(id: number): void {
    this.router.navigate(['/services/update', id]);
  }

  detail(id: number): void {
    this.router.navigate(['/services/detail', id]);
  }

  delete(id: number): void {
    this.router.navigate(['/services/delete', id]);
  }

  create(): void {
    this.router.navigate(['/services/create']);
  }
}
