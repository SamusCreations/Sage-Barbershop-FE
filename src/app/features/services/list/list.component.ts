import { Component } from '@angular/core';
import { CrudServicesService } from '../services/crud-services.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  services: any[] = [];
  charging: boolean = true
  chargingSuccesfully: boolean = false
  

  constructor(private servicesService: CrudServicesService, private router: Router) { 
    
  }

  ngOnInit(): void {
    this.fetchServices();
  }

  async fetchServices(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.services = data;
        this.chargingSuccesfully = true
        // this.services.forEach((product) => {
        //   this.loadImagePreview(product);
        // });
      },
      error: (error) => {
        this.chargingSuccesfully = false
        console.error('Error al obtener datos de facturas', error);
      },
      complete: () => {
        this.charging = false
        console.log('Fetch invoices complete');
      }
    };

    this.servicesService.getAll().subscribe(observer);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/services/detail', id]);
  }

  // loadImagePreview(product: any): void {
  //   const defaultImageName = 'image-not-found';
  
  //   const handleImageError = (error: any, fallbackImage: string) => {
  //     console.error('Error fetching image:', error);
  
  //     if (fallbackImage) {
  //       this.imageService.getImage(fallbackImage, 300).subscribe(
  //         (fallbackBlob: Blob) => {
  //           const fallbackURL = URL.createObjectURL(fallbackBlob);
  //           product.image = fallbackURL;
  //         },
  //         (fallbackError) => {
  //           console.error('Error fetching fallback image:', fallbackError);
  //           product.image = defaultImageName; // Use default image path if fallback also fails
  //         }
  //       );
  //     }
  //   };
  
  //   if (product.image) {
  //     this.imageService.getImage(product.image, 300).subscribe(
  //       (imageBlob: Blob) => {
  //         const objectURL = URL.createObjectURL(imageBlob);
  //         product.image = objectURL;
  //       },
  //       (error) => handleImageError(error, defaultImageName) // Call handleImageError with fallback image
  //     );
  //   }
  // }
}
