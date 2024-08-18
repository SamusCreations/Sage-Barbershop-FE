import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { initFlowbite, Dropdown } from 'flowbite';
import type { DropdownOptions, DropdownInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';


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

    // Detecta cambios de ruta y reinicia Flowbite
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        initFlowbite(); // Re-inicializa Flowbite después de cada cambio de ruta
      }
    });
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

  ngAfterViewInit() {
    initFlowbite();
  }
}
