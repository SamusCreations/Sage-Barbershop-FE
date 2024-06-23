import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  reservation: any = null;
  charging: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private reservationService: CrudReservationsService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.fetchInvoiceDetail(id);
  }

  fetchInvoiceDetail(id: number): void {
    this.charging = true;
    this.reservationService.findById(id).subscribe({
      next: (data) => {
        this.reservation = data.shift();
        this.charging = false;
      },
      error: (error) => {
        console.error('Error fetching invoice detail:', error);
        this.charging = false;
      }
    });
  }
  goBack(): void {
    this.location.back(); // Navega hacia atrás en el historial
  }
}
