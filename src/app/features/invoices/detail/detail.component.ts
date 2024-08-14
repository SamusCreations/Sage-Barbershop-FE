import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CrudInvoicesService } from '../services/crud-invoices.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent {
  invoice: any = null;
  charging: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private invoiceService: CrudInvoicesService
  ) {}

  ngOnInit(): void {
    this.fetchInvoiceDetail(this.data.id);
  }

  fetchInvoiceDetail(id: number): void {
    this.charging = true;
    this.invoiceService.findById(id).subscribe({
      next: (data) => {
        this.invoice = data.shift();
        console.log(
          '🚀 ~ DetailComponent ~ this.invoiceService.findById ~ this.invoice:',
          this.invoice
        );
        this.charging = false;
      },
      error: (error) => {
        console.error('Error fetching invoice detail:', error);
        this.charging = false;
      },
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
