import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrudSchedulesService } from '../services/crud-schedules.service';
import { Router } from '@angular/router';
import { Observer, Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../../shared/services/authentication.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  schedules: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;
  branchList: any;
  selectedBranch: number | null = null;
  currentUser: any;

  constructor(
    private CrudService: CrudSchedulesService,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe(
      (user: any) => (this.currentUser = user)
    );

    this.getAllSchedules();
    this.getBranches();
  }

  async getAllSchedules(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.schedules = data;
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

    if (this.currentUser.role === 'ADMIN') {
      this.CrudService.getAll().subscribe(observer);
    } else {
      this.CrudService.findByBranch(this.currentUser.branchId).subscribe(
        observer
      );
    }
  }

  getBranches() {
    this.branchList = null;
    this.CrudService.getBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.branchList = data;
      });
  }

  getScheduleByBranch(branchId: number | null) {
    if (branchId === null) {
      this.getAllSchedules();
    } else {
      this.schedules = null;
      this.CrudService.findByBranch(branchId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.schedules = data;
        });
    }
  }

  onBranchChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const branchId =
      selectElement.value === 'all' ? null : Number(selectElement.value);
    this.selectedBranch = branchId;
    this.getScheduleByBranch(branchId);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  update(id: number): void {
    this.router.navigate(['/schedules/update', id]);
  }

  detail(id: number): void {
    this.router.navigate(['/schedules/detail', id]);
  }

  delete(id: number): void {
    this.router.navigate(['/schedules/delete', id]);
  }

  create(): void {
    this.router.navigate(['/schedules/create']);
  }
}
