import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isSubMenuOpen = false;

  constructor(private router: Router){}
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
}
