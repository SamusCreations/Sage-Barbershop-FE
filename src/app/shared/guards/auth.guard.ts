import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authtentication.service';
import {
  NotificacionService,
  messageType,
} from '../services/notification/notification.service';
import { inject } from '@angular/core';

export class UserGuard {
  authService: AuthenticationService = inject(AuthenticationService);
  router: Router = inject(Router);
  noti: NotificacionService = inject(NotificacionService);
  auth: boolean = false;
  currentUser: any;
  constructor() {
    //Subscripción a la información del usuario actual
    this.authService.decodeToken.subscribe((user) => (this.currentUser = user));
    //Subscripción al boolean que indica si esta autenticado
    this.authService.isAuthenticated.subscribe((valor) => (this.auth = valor));
  }
  
  checkUserLogin(route: ActivatedRouteSnapshot): boolean {
    if (this.auth) {
      const userRole = this.currentUser.role;
      if (
        route.data['roles'].length &&
        !route.data['roles'].includes(userRole)
      ) {
        this.noti.messageRedirect(
          'Usuario',
          `Usuario Sin permisos para acceder`,
          messageType.warning,
          '/usuario/login'
        );
        this.router.navigate(['/usuario/login']);
        return false;
      }
      return true;
    }

    this.noti.messageRedirect(
      'Usuario',
      `Usuario No autenticado`,
      messageType.warning,
      '/usuario/login'
    );
    this.router.navigate(['/usuario/login']);
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  let guard = new UserGuard();
  if (guard.checkUserLogin(route)) {
    return true;
  } else {
    return false;
  }
};
