import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../shared/services/cart.service';
import {
  messageType,
  NotificationService,
} from '../../../shared/services/notification.service';
import { CrudInvoicesService } from '../../invoices/services/crud-invoices.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { ImageService } from '../../../shared/services/image.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  total = 0;
  fecha = Date.now();
  qtyItems = 0;
  dataSource: any;
  user: any;

  constructor(
    private router: Router,
    private cartService: CartService,
    private noti: NotificationService,
    private invoicesCrud: CrudInvoicesService,
    private authService: AuthenticationService,
    private imageService: ImageService
  ) {
    this.cartService.getTotal.subscribe((value) => {
      this.total = value;
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => (this.user = user));

    //Obtener todos los items de la Compra
    this.cartService.currentDataCart$.subscribe((data) => {
      this.dataSource = data;
      this.dataSource.forEach((item) => {
        this.loadImagePreview(item.product || item.service);
      });
    });

    this.cartService.getTotal.subscribe((value) => {
      this.total = value;
    });
  }

  updateQuantity(item: any) {
    this.cartService.addToCart(item);
    //Notificacion
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item);
  }

  registerOrder() {
    /*     if (this.cartService.getItems != null) {
      //Obtener los items de la compra
      let itemCompra = this.cartService.getItems;
      //Armar estructura de la Orden para el API
      //Detalle de la compra [{'videojuegoId':valor,'cantidad':valor}]
      let detalle = itemCompra.map((x) => ({
        ['videojuegoId']: x.idItem,
        ['cantidad']: x.cantidad,
      }));
      //Datos para el API
      let orden = {
        fechaOrden: new Date(this.fecha),
        videojuegos: detalle,
      };
      //Guardar Orden
      this.invoicesCrud.create(orden).subscribe((respuesta) => {
        this.noti.message(
          'Order',
          'Order created #' + respuesta.id,
          messageType.success
        );
        this.cartService.deleteCart();
      });
    } else {
      this.noti.message('Order', 'Add at least one item', messageType.warning);
    } */
  }

  loadImagePreview(item: any): void {
    const defaultImageName = 'image-not-found';

    const handleImageError = (error: any, fallbackImage: string) => {
      console.error('Error fetching image:', error);

      if (fallbackImage) {
        this.imageService.getImage(fallbackImage, 300).subscribe(
          (fallbackBlob: Blob) => {
            const fallbackURL = URL.createObjectURL(fallbackBlob);
            item.image = fallbackURL;
          },
          (fallbackError) => {
            console.error('Error fetching fallback image:', fallbackError);
            item.image = defaultImageName; // Use default image path if fallback also fails
          }
        );
      }
    };

    if (item.image) {
      console.log(item.name)
      this.imageService.getImage(item.image, 300).subscribe(
        (imageBlob: Blob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          item.image = objectURL;
        },
        (error) => handleImageError(error, defaultImageName) // Call handleImageError with fallback image
      );
    }
  }
}
