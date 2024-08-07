import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { Router } from '@angular/router';
import { Observer, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataList: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;

  constructor(
    private CrudService: CrudReservationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllSchedules();
  }

  async getAllSchedules(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.dataList = data;
        this.chargingSuccesfully = true;
      },
      error: (error) => {
        this.chargingSuccesfully = false;
        console.error('Error al obtener datos', error);
      },
      complete: () => {
        this.charging = false;
        console.log('Fetch complete');
      },
    };

    this.CrudService.findByManager(2).subscribe(observer);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  update(id: number): void {
    this.router.navigate(['/reservations/update', id]);
  }

  detail(id: number): void {
    this.router.navigate(['/reservations/detail', id]);
  }

  delete(id: number): void {
    this.router.navigate(['/reservations/delete', id]);
  }

  create(): void {
    this.router.navigate(['/reservations/create']);
  }

  // Nuevo método para manejar la búsqueda
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value;
    this.filterByClient(searchValue, 2);
  }

  filterByClient(name: string, id: number): void {
    if (name) {
      const observer: Observer<any> = {
        next: (data) => {
          this.dataList = data;
          this.chargingSuccesfully = true;
        },
        error: (error) => {
          this.chargingSuccesfully = false;
          console.error('Error al obtener datos de clientes', error);
        },
        complete: () => {
          this.charging = false;
          console.log('Fetch client reservations complete');
        },
      };

      this.CrudService.findByClient(name, id).subscribe(observer);
    } else {
      this.getAllSchedules(); // Si no hay valor de búsqueda, se obtienen todas las reservas
    }
  }
}
