import { Component, OnInit } from '@angular/core';
import { CrudProductsService } from '../services/crud-products.service';
import { Router } from '@angular/router';
import { Observer, Subject, takeUntil } from 'rxjs';
import { ImageService } from '../../../shared/services/image.service';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification.service';
import { CartService } from '../../../shared/services/cart.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  products: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;
  user: any;

  constructor(
    private productService: CrudProductsService,
    private router: Router,
    private imageService: ImageService,
    private noti: NotificationService,
    private cartService: CartService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.user = user;
    });

    this.fetchProducts();
  }

  async fetchProducts(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.products = data;
        this.products.forEach((product) => {
          this.loadImagePreview(product);
        });
        this.chargingSuccesfully = true;
      },
      error: (error) => {
        this.chargingSuccesfully = false;
        console.error('Error al obtener datos de productos', error);
      },
      complete: () => {
        this.charging = false;
        console.log('Fetch products complete');
      },
    };

    this.productService.getAll().subscribe(observer);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/products/detail', id]);
  }

  loadImagePreview(product: any): void {
    const defaultImageName = 'image-not-found';

    const handleImageError = (error: any, fallbackImage: string) => {
      console.error('Error fetching image:', error);

      if (fallbackImage) {
        this.imageService.getImage(fallbackImage, 300).subscribe(
          (fallbackBlob: Blob) => {
            const fallbackURL = URL.createObjectURL(fallbackBlob);
            product.image = fallbackURL;
          },
          (fallbackError) => {
            console.error('Error fetching fallback image:', fallbackError);
            product.image = defaultImageName; // Use default image path if fallback also fails
          }
        );
      }
    };

    if (product.image) {
      this.imageService.getImage(product.image, 300).subscribe(
        (imageBlob: Blob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          product.image = objectURL;
        },
        (error) => handleImageError(error, defaultImageName) // Call handleImageError with fallback image
      );
    }
  }

  addToCart(id: number) {
    // Verificar si el usuario está logueado
    if (!this.user) {
      this.noti.message(
        'Login Required',
        'Please log in to add services to the cart.',
        messageType.warning
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    this.productService
      .findById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        //Agregarlo a la compra
        this.cartService.addToCart(res);
        this.noti.message(
          'Order',
          'Product ' + res.name + ' added to the order',
          messageType.success
        );
      });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
