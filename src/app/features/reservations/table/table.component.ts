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

  startDate: Date | null = null;
  endDate: Date | null = null;

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

    this.getAllReservations();
  }

  async getAllReservations(): Promise<void> {
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
    // Si no hay fechas seleccionadas, obtener todas las reservaciones
    this.CrudService.findByManager(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(observer);
  }

  onStartDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.startDate = new Date(inputElement.value);
    this.filterByDate();
  }

  onEndDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.endDate = new Date(inputElement.value);
    console.log(this.endDate);
    this.filterByDate();
  }

  filterByDate(): void {
    if (this.startDate && this.endDate) {
      this.dataList = this.dataList.filter((reservation) => {
        const reservationDate = new Date(reservation.date);
        return (
          reservationDate >= this.startDate && reservationDate <= this.endDate
        );
      });
    } else {
      this.dataList = this.dataList; // Si no hay fechas, mostrar todos los datos
    }
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
      this.dataList = this.dataList.filter((item) =>
        (
          item.User.name.toLowerCase() +
          ' ' +
          item.User.surname.toLowerCase()
        ).includes(name.toLowerCase())
      );
    } else {
      this.getAllReservations(); // Fetch all reservations again if the search field is cleared
    }
  }
}
