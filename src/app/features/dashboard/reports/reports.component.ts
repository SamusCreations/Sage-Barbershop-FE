import { Component, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { ChangeDetectorRef } from '@angular/core';
import { CrudReservationsService } from '../../reservations/services/crud-reservations.service';
import { CrudInvoicesService } from '../../invoices/services/crud-invoices.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  public chartOptions: ApexOptions = {};
  public productChartOptions: ApexOptions = {};
  public serviceChartOptions: ApexOptions = {};
  public reservationStatusChartOptions: ApexOptions = {};
  totalReservations: number = 0;
  currentUser: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthenticationService,
    private reservationService: CrudReservationsService,
    private invoicesService: CrudInvoicesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });

    this.reservationService.getTodayCountByBranch().subscribe((data) => {
      data.map((item) => (this.totalReservations += item.count));
      this.todayCountChart(data);
    });

    this.invoicesService.getTopProducts().subscribe((data) => {
      this.createProductChart(data);
    });

    this.invoicesService.getTopServices().subscribe((data) => {
      this.createServiceChart(data);
    });

    // Cargar y mostrar los datos de citas por estado
    if (this.currentUser?.branchId) {
      this.reservationService
        .getCountByStatus(this.currentUser.branchId)
        .subscribe((data) => {
          this.createReservationStatusChart(data);
        });
    }

    this.cdr.detectChanges();
  }

  todayCountChart(data: any[]): void {
    const branchNames = data.map((item) => item.branchName);
    const counts = data.map((item) => item.count);

    this.chartOptions = {
      chart: {
        type: 'bar',
        height: 350,
      },
      series: [
        {
          name: 'Reservations Count',
          data: counts,
        },
      ],
      xaxis: {
        categories: branchNames,
        title: {
          text: 'Branches',
        },
      },
      yaxis: {
        title: {
          text: 'Reservations',
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: {
        enabled: true,
      },
      title: {
        text: 'Reservations Count by Branch for Today',
        align: 'center',
      },
    };
  }

  createProductChart(data: any[]): void {
    const productNames = data.map((item) => item.productName);
    const totalQuantities = data.map((item) => item.totalQuantity);

    this.productChartOptions = {
      chart: {
        type: 'pie', // Pie chart for product sales
        height: 350,
      },
      series: totalQuantities,
      labels: productNames,
      title: {
        text: 'Top 3 Sold Products',
        align: 'center',
      },
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
      },
    };
  }

  createServiceChart(data: any[]): void {
    const serviceNames = data.map((item) => item.serviceName);
    const totalQuantities = data.map((item) => item.totalQuantity);

    this.serviceChartOptions = {
      chart: {
        type: 'bar', // Bar chart for service sales
        height: 350,
      },
      series: [
        {
          name: 'Total Quantity',
          data: totalQuantities,
        },
      ],
      xaxis: {
        categories: serviceNames,
        title: {
          text: 'Services',
        },
      },
      yaxis: {
        title: {
          text: 'Total Quantity',
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: {
        enabled: true,
      },
      title: {
        text: 'Top 3 Sold Services',
        align: 'center',
      },
    };
  }

  createReservationStatusChart(data: any[]): void {
    const statusDescriptions = data.map((item) => item.statusDescription);
    const counts = data.map((item) => item.count);
    const colors = data.map((item) => item.color);

    this.reservationStatusChartOptions = {
      chart: {
        type: 'donut', // Donut chart for reservation statuses
        height: 350,
      },
      series: counts,
      labels: statusDescriptions,
      colors: colors,
      title: {
        text: 'Reservation Status Distribution',
        align: 'center',
      },
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
      },
    };
  }

  viewDetail(id: number): void {
    this.router.navigate(['/branches/detail', id]);
  }
}
