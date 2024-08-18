import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudProductsService } from '../services/crud-products.service';
import { Subject, takeUntil } from 'rxjs';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification.service';
import { ImageService } from '../../../shared/services/image.service';
import { CartService } from '../../../shared/services/cart.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  product: any = null;
  charging: boolean = true;
  idObject: number = 0;

  constructor(
    private router: Router,
    private activeRouter: ActivatedRoute,
    private crudService: CrudProductsService,
    private noti: NotificationService,
    private imageService: ImageService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject != undefined) {
        this.crudService
          .findById(this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
              this.product = data;
              this.loadImagePreview(this.product);
              this.charging = false;
            },
            (error) => {
              console.error('Error fetching product details:', error);
              this.noti.message(
                'Error',
                `An error occurred: ${error.message}`,
                messageType.error
              );
              this.charging = false;
            }
          );
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  addToCart() {
    //Agregarlo a la compra
    this.cartService.addToCart(this.product);
    this.noti.message(
      'Order',
      'Product ' + this.product.name + ' added to the order',
      messageType.success
    );
  }

  loadImagePreview(product: any): void {
    const defaultImageName = 'image-not-found';

    const handleImageError = (error: any, fallbackImage: string) => {
      console.error('Error fetching image:', error);

      if (fallbackImage) {
        this.imageService.getImage(fallbackImage, 1024).subscribe(
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
      this.imageService.getImage(product.image, 1024).subscribe(
        (imageBlob: Blob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          product.image = objectURL;
        },
        (error) => handleImageError(error, defaultImageName) // Call handleImageError with fallback image
      );
    }
  }
}
