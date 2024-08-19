import { Component, OnInit } from '@angular/core';
import { CrudUsersService } from '../services/crud-users.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {

  users: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;
  open: boolean = false;


  constructor(
    private userService: CrudUsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  async fetchUsers(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.users = data;
        this.chargingSuccesfully = true;
      },
      error: (error) => {
        this.chargingSuccesfully = false;
        console.error('Error al obtener datos', error);
      },
      complete: () => {
        this.charging = false;
      },
    };

    this.userService.getAll().subscribe(observer);
  }

  update(id: number): void {
    this.router.navigate(['/users/update', id]);
  }

  detail(id: number): void {
    this.router.navigate(['/users/detail', id]);
  }

  delete(id: number): void {
    this.router.navigate(['/users/delete', id]);
  }

  create(): void {
    this.router.navigate(['/users/create']);
  }
}
