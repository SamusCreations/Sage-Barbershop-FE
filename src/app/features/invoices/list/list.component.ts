import { Component, OnInit } from '@angular/core';
import { CrudInvoicesService } from '../services/crud-invoices.service';
import { Observer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit{
  invoices: any[] = [];
  charging: boolean = true
  chargingSuccesfully: boolean = false

  constructor(private invoiceService: CrudInvoicesService, private router: Router) { }

  ngOnInit(): void {
    this.fetchInvoices();
  }

  async fetchInvoices(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.invoices = data;
        this.chargingSuccesfully = true
      },
      error: (error) => {
        this.chargingSuccesfully = false
        console.error('Error al obtener datos de facturas', error);
      },
      complete: () => {
        this.charging = false
        console.log('Fetch invoices complete');
      }
    };

    this.invoiceService.getAll().subscribe(observer);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/invoices/detail', id]);
  }

}


