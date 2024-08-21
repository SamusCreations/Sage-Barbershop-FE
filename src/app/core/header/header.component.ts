import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('dropdownAnimation', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        })
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-1rem)',
        })
      ),
      transition('closed => open', [animate('300ms ease-out')]),
      transition('open => closed', [animate('300ms ease-in')]),
    ]),
  ],
})
export class HeaderComponent {
  openDropdowns: { [key: string]: boolean } = {};
  currentUser: any;
  qtyItems: number = 0;
  isMobileMenuOpen: boolean = false;
  isUserMenuOpen: boolean = false;

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeAllDropdowns();
    }
  }

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private cartService: CartService,
    private elementRef: ElementRef
  ) {
    this.authService.decodeToken.subscribe(
      (user: any) => (this.currentUser = user)
    );

    this.cartService.countItems.subscribe((valor) => {
      this.qtyItems = valor;
    });
  }

  toggleDropdown(dropdownId: string) {
    // Cierra todos los dropdowns excepto el que se está alternando
    Object.keys(this.openDropdowns).forEach((key) => {
      if (key !== dropdownId) {
        this.openDropdowns[key] = false;
      }
    });

    // Alterna el estado del dropdown seleccionado
    this.openDropdowns[dropdownId] = !this.openDropdowns[dropdownId];
  }

  closeDropdown(menu: string) {
    this.openDropdowns[menu] = false;
  }

  closeAllDropdowns() {
    Object.keys(this.openDropdowns).forEach((key) => {
      this.openDropdowns[key] = false;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeAllDropdowns();
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/auth/login']);
  }
}
