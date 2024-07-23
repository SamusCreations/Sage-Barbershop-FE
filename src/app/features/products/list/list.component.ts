import { Component, OnInit } from '@angular/core';
import { CrudProductsService } from '../services/crud-products.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';
import { ImageService } from '../../../shared/image/image.service';

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
    private imageService: ImageService
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
    if (product.image) {
      this.imageService.getImage(product.image, 300).subscribe(
        (imageBlob: Blob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          product.image = objectURL; // Añadir la URL de la imagen al producto
        },
        (error) => {
          console.error('Error fetching image:', error);
        }
      );
    } else {
      product.image = 'path/to/default/image.jpg'; // Imagen por defecto
    }
  }
}
