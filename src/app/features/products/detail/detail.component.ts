import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudProductsService } from '../services/crud-products.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  product: any = null;
  charging: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private productService: CrudProductsService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.fetchInvoiceDetail(id);
  }

  fetchInvoiceDetail(id: number): void {
    this.charging = true;
    this.productService.findById(id).subscribe({
      next: (data) => {
        this.product = data.shift();
        this.charging = false;
      },
      error: (error) => {
        console.error('Error fetching invoice detail:', error);
        this.charging = false;
      }
    });
  }
}
