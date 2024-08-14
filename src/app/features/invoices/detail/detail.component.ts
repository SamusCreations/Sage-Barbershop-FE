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
        this.charging = false;
      },
      error: (error) => {
        console.error('Error fetching invoice detail:', error);
        this.charging = false;
      },
    });
  }

  markAsInvoice(id: number): void {
    this.invoiceService.setAsInvoice(id).subscribe({
      next: (response) => {
        this.invoice.status = true;
        console.log('Invoice status updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating invoice status:', error);
      },
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
