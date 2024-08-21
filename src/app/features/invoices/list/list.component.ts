import { Component, OnInit } from '@angular/core';
import { CrudInvoicesService } from '../services/crud-invoices.service';
import { DetailComponent } from '../detail/detail.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  invoices: any[] = [];
  charging: boolean = true;
  chargingSuccessfully: boolean = false;
  currentUser: any;

  constructor(
    private invoiceService: CrudInvoicesService,
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe(
      (user: any) => (this.currentUser = user)
    );

    this.fetchInvoices();
  }

  async fetchInvoices(): Promise<void> {
    if (this.currentUser.role === 'ADMIN') {
      this.invoiceService.getAll().subscribe({
        next: (data) => {
          this.invoices = data;
          this.chargingSuccessfully = true;
        },
        error: (error) => {
          this.chargingSuccessfully = false;
          console.error('Error al obtener datos de facturas', error);
        },
        complete: () => {
          this.charging = false;
          console.log('Fetch invoices complete');
        },
      });
    } else {
      this.invoiceService.findByEmployee(this.currentUser.branchId).subscribe({
        next: (data) => {
          this.invoices = data;
          this.chargingSuccessfully = true;
        },
        error: (error) => {
          this.chargingSuccessfully = false;
          console.error('Error al obtener datos de facturas', error);
        },
        complete: () => {
          this.charging = false;
          console.log('Fetch invoices complete');
        },
      });
    }
  }

  openDetailDialog(invoiceId: number): void {
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '90vw', // 90% del ancho de la pantalla
      height: '90vh', // 90% del alto de la pantalla
      data: { id: invoiceId },
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recargar facturas después de cerrar el modal
      this.fetchInvoices();
    });
  }

  create(): void {
    this.router.navigate(['/invoices/create']);
  }
  update(id: number): void {
    this.router.navigate(['/invoices/update', id]);
  }
}
