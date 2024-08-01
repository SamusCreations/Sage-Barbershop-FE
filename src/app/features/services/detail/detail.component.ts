import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudServicesService } from '../services/crud-services.service';
import { Subject, takeUntil } from 'rxjs';
import {
  NotificacionService,
  messageType,
} from '../../../shared/services/notification/notification.service';
import { ImageService } from '../../../shared/services/imageService/image.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  service: any = null;
  charging: boolean = true;
  idObject: number = 0;

  constructor(
    private activeRouter: ActivatedRoute,
    private crudService: CrudServicesService,
    private noti: NotificacionService,
    private imageService: ImageService
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
              this.service = data;
              this.charging = false;
              this.loadImagePreview(this.service)
            },
            (error) => {
              console.error('Error fetching service details:', error);
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
