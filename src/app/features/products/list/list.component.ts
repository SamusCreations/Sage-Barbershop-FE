import { Component, OnInit } from '@angular/core';
import { CrudProductsService } from '../services/crud-products.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';
import { ImageService } from '../../../shared/image/image.service';
import { NotificacionService, messageType } from '../../../shared/notification/notification.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  products: any[] = [];
  charging: boolean = true;
  chargingSuccesfully: boolean = false;

  constructor(
    private productService: CrudProductsService,
    private router: Router,
    private imageService: ImageService,
    private noti: NotificacionService,
  ) {}

  ngOnInit(): void {
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
  
}
