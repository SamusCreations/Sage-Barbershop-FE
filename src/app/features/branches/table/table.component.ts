import { Component, OnInit } from '@angular/core';
import { CrudBranchesService } from '../services/crud-branches.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

interface Heading {
  key: string;
  value: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  headings: Heading[] = [
    { key: 'id', value: 'ID' },
    { key: 'name', value: 'Name' },
    { key: 'phone', value: 'Phone' },
    { key: 'address', value: 'Address' },
  ];

  branches: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;

  selectedRows: number[] = [];
  open: boolean = false;

  constructor(
    private CrudService: CrudBranchesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  async fetchServices(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.branches = data;
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

    this.CrudService.getAll().subscribe(observer);
  }

  update(id: number): void {
    this.router.navigate(['/branches/update', id]);
  }

  create(): void {
    this.router.navigate(['/branches/create']);
  }

  toggleColumn(key: string): void {
    const columns = document.querySelectorAll<HTMLElement>(`.${key}`);
    columns.forEach((column) => {
      column.classList.toggle('hidden');
    });
  }

  getRowDetail(event: Event, id: number): void {
    const index = this.selectedRows.indexOf(id);
    if (index > -1) {
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRows.push(id);
    }
  }

  selectAllCheckbox(event: Event): void {
    const target = event.target as HTMLInputElement;
    const columns = document.querySelectorAll<HTMLInputElement>('.rowCheckbox');

    this.selectedRows = [];
    columns.forEach((column) => {
      column.checked = target.checked;
      if (target.checked) {
        this.selectedRows.push(parseInt(column.name));
      }
    });
  }
}
