import { Component, OnInit } from '@angular/core';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  reservations: any[] = [];
  charging: boolean = true
  chargingSuccesfully: boolean = false

  constructor(private reservationsService: CrudReservationsService, private router: Router) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  async fetchProducts(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.reservations = data;
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

    this.reservationsService.getByManager(3).subscribe(observer);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/reservations/detail', id]);
  }
}
