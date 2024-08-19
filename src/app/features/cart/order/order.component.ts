import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  total: string;
  fecha = Date.now();
  qtyItems = 0;
  dataSource: any;
  user: any;

  @Output() quantityChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private noti: NotificationService,
    private invoicesCrud: CrudInvoicesService,
    private authService: AuthenticationService,
    private imageService: ImageService
  ) {
    this.cartService.getTotal.subscribe((value) => {
      this.total = value.toFixed(2);
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => (this.user = user));

    // Obtener todos los items de la Compra
    this.cartService.currentDataCart$.subscribe((data) => {
      this.dataSource = data.map((item) => {
        const itemCopy = { ...item }; // Crear una copia del item
        this.loadImagePreview(itemCopy.product || itemCopy.service, itemCopy);
        return itemCopy;
      });
    });

    this.cartService.getTotal.subscribe((value) => {
      this.total = value.toFixed(2);
    });
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item);
  }

  // Aqui se necesita crear un formData para crear la factura proforma a través de la ruta del api
  registerOrder() {
    // Verificar si el usuario está logueado
    if (!this.user) {
      this.noti.message(
        'Login Required',
        'Please log in to proceed to Checkout.',
        messageType.warning
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.dataSource && this.dataSource.length > 0) {
      // Formatear la fecha
      const formattedDate = new Date(this.fecha).toISOString();

      // Crear FormData para la factura proforma
      const invoiceFormData = new FormData();
      invoiceFormData.append('date', formattedDate);
      invoiceFormData.append('branchId', this.user.branchId); // Asumiendo que el usuario tiene una sucursal asociada
      invoiceFormData.append('userId', this.user.id);
      invoiceFormData.append('total', this.total);

      // Añadir los detalles de los productos/servicios en la factura
      this.dataSource.forEach((item: any, index: number) => {
        const isProduct = item.product !== undefined;
        invoiceFormData.append(
          `invoiceDetails[${index}][${isProduct ? 'productId' : 'serviceId'}]`,
          isProduct ? item.product.id : item.service.id
        );
        invoiceFormData.append(
          `invoiceDetails[${index}][quantity]`,
          item.quantity.toString()
        );
        invoiceFormData.append(
          `invoiceDetails[${index}][price]`,
          item.price.toString()
        );
        invoiceFormData.append(
          `invoiceDetails[${index}][subtotal]`,
          (item.quantity * item.price).toString()
        );
      });

      // Llamar al servicio para crear la factura proforma
      this.invoicesCrud.create(invoiceFormData).subscribe(
        (invoiceData) => {
          console.log('Invoice created:', invoiceData);
          this.noti.messageRedirect(
            'Order Completed',
            `Your order and invoice have been created successfully.`,
            messageType.success,
            '/orders/history' // Redirigir al historial de órdenes o donde sea apropiado
          );
          this.cartService.deleteCart(); // Limpiar el carrito después de la compra
        },
        (error) => {
          console.error('Error creating invoice:', error);
          this.noti.message(
            'Error',
            'Failed to create the invoice.',
            messageType.error
          );
        }
      );
    } else {
      this.noti.message('Order', 'No items in the cart', messageType.warning);
    }
  }

  loadImagePreview(item: any, itemCopy: any): void {
    const defaultImageName = 'image-not-found';

    const handleImageError = (error: any, fallbackImage: string) => {
      console.error('Error fetching image:', error);

      if (fallbackImage) {
        this.imageService.getImage(fallbackImage, 300).subscribe(
          (fallbackBlob: Blob) => {
            const fallbackURL = URL.createObjectURL(fallbackBlob);
            itemCopy.image = fallbackURL; // Asignar a la copia del item
          },
          (fallbackError) => {
            console.error('Error fetching fallback image:', fallbackError);
            itemCopy.image = defaultImageName; // Usar imagen por defecto si también falla la imagen de reserva
          }
        );
      }
    };

    if (item.image) {
      this.imageService.getImage(item.image, 300).subscribe(
        (imageBlob: Blob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          itemCopy.image = objectURL; // Asignar a la copia del item
        },
        (error) => handleImageError(error, defaultImageName)
      );
    }
  }

  increaseQuantity(item: any): void {
    this.updateQuantity(item);
  }

  decreaseQuantity(item: any): void {
    this.updateQuantity(item, false);
  }

  updateQuantity(item: any, increase: boolean = true): void {
    this.cartService.addToCart(item, increase);
  }
}
