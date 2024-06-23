import { Component } from '@angular/core';
import { CrudServicesService } from '../services/crud-services.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  service: any = null;
  charging: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private serviceService: CrudServicesService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.fetchInvoiceDetail(id);
  }

  fetchInvoiceDetail(id: number): void {
    this.charging = true;
    this.serviceService.findById(id).subscribe({
      next: (data) => {
        this.service = data.shift();
        this.charging = false;
      },
      error: (error) => {
        console.error('Error fetching invoice detail:', error);
        this.charging = false;
      }
    });
  }
}
