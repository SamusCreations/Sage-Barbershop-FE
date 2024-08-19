import { Component } from '@angular/core';
import { CrudBranchesService } from '../services/crud-branches.service';
import { Router } from '@angular/router';
import { Observer, Subject, takeUntil } from 'rxjs';
import {
  messageType,
  NotificationService,
} from '../../../shared/services/notification.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { CrudUsersService } from '../../users/services/crud-users.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  branches: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;
  currentUser: any

  constructor(
    private branchesService: CrudBranchesService,
    private router: Router,
    private noti: NotificationService,
    private authService: AuthenticationService,
    private crudUsersService: CrudUsersService
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });

    this.fetchBranches();
  }

  async fetchBranches(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.branches = data;
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

    this.branchesService.getAll().subscribe(observer);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/branches/detail', id]);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  selectStore(branchId: number): void {
    // Verificar si el usuario está logueado
    if (!this.currentUser) {
      this.noti.message('Login Required', 'Please log in to select a store.', messageType.warning);
      this.router.navigate(['/auth/login']);
      return;
    }
  
    // Verificar si el usuario tiene el rol de cliente
    if (this.currentUser.role !== 'CLIENT') {
      this.noti.message('Unauthorized', 'Only clients can select a store.', messageType.error);
      this.router.navigate(['/auth/login']);
      return;
    }
  
    // Crear el FormData para la actualización del usuario
    const formData = new FormData();
    formData.append('id', this.currentUser.id.toString());
    formData.append('branchId', branchId.toString());
  
    // Llamar al servicio para actualizar el usuario
    this.crudUsersService.update(formData).subscribe({
      next: (response) => {
        this.authService.logout();
        this.currentUser = null;
        
        this.noti.message('Store Selected', 'Your store has been updated successfully. Please log in again to see the changes.', messageType.success);
        
        // Cerrar sesión actual y redirigir al login
        this.authService.logout();
        this.currentUser = null;
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Error updating user', error);
        this.noti.message('Update Failed', 'Failed to update your store. Please try again.', messageType.error);
      }
    });
  }
  
  
}
