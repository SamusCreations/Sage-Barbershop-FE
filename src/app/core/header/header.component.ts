import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isSubMenuOpen = false;
  currentUser: any;

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.authService.decodeToken.subscribe(
      (user: any) => (this.currentUser = user)
    );
  }
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }

  navigateTo(path: string) {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/auth/login']); 
  }
}
