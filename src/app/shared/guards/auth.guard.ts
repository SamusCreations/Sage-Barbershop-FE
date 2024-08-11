import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';
import {
  NotificationService,
  messageType,
} from '../services/notification/notification.service';
import { inject } from '@angular/core';

export class UserGuard {
  authService: AuthenticationService = inject(AuthenticationService);
  router: Router = inject(Router);
  notification: NotificationService = inject(NotificationService);
  isAuthenticated: boolean = false;
  currentUser: any;

  constructor() {
    // Subscription to the current user's information
    this.authService.decodeToken.subscribe((user) => (this.currentUser = user));
    // Subscription to the boolean indicating if the user is authenticated
    this.authService.isAuthenticated.subscribe(
      (value) => (this.isAuthenticated = value)
    );
  }

  checkUserLogin(route: ActivatedRouteSnapshot): boolean {
    if (this.isAuthenticated) {
      const userRole = this.currentUser.role;
      if (
        route.data['roles'].length &&
        !route.data['roles'].includes(userRole)
      ) {
        this.notification.messageRedirect(
          'User',
          `User does not have permission to access`,
          messageType.warning,
          '/auth/login'
        );
        this.router.navigate(['/auth/login']);
        return false;
      }
      return true;
    }

    this.notification.messageRedirect(
      'User',
      `User not authenticated`,
      messageType.warning,
      '/auth/login'
    );
    this.router.navigate(['/auth/login']);
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
