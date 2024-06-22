import { Component } from '@angular/core';
import { CrudInvoicesService } from '../services/crud-invoices.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  invoice: any = null;
  charging: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: CrudInvoicesService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.fetchInvoiceDetail(id);
  }

  fetchInvoiceDetail(id: number): void {
    this.charging = true;
    this.invoiceService.findById(id).subscribe({
      next: (data) => {
        this.invoice = data.shift();
        console.log("🚀 ~ DetailComponent ~ this.invoiceService.findById ~ this.invoice:", this.invoice)
        this.charging = false;
      },
      error: (error) => {
        console.error('Error fetching invoice detail:', error);
        this.charging = false;
      }
    });
  }
}
