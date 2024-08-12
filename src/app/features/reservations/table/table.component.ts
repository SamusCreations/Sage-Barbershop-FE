import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { Router } from '@angular/router';
import { Observer, Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../../shared/services/authentication/authentication.service';

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
  currentUser: any;

  constructor(
    private CrudService: CrudReservationsService,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe(
      (user: any) => (this.currentUser = user)
    );

    console.log(this.currentUser);

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

    this.CrudService.findByManager(this.currentUser.id).subscribe(observer);
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
    this.filterByClient(searchValue, this.currentUser.id);
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
