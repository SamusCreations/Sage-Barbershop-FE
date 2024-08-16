import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CrudServicesService } from '../../services/services/crud-services.service';
import { CrudInvoicesService } from '../services/crud-invoices.service';
import { CrudProductsService } from '../../products/services/crud-products.service';
import { CrudBranchesService } from '../../branches/services/crud-branches.service';
import { NotificationService, messageType } from '../../../shared/services/notification/notification.service';
import { FormErrorMessage } from '../../../form-error-message';
import { AuthenticationService } from '../../../shared/services/authentication/authentication.service';
import { SearchModalComponent } from '../../../shared/components/search-modal/search-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  form: FormGroup;
  serviceList: any = [];
  productList: any = [];
  branchList: any = [];
  userList: any = [];
  titleForm = 'Create';
  selectedProduct: any;

  user: {
    Branch: {
      id: null
    }
    name: "",
    surname: ""
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicesCrud: CrudServicesService,
    private invoicesCrud: CrudInvoicesService,
    private productsCrud: CrudProductsService,
    private branchesCrud: CrudBranchesService,
    private noti: NotificationService,
    private authService: AuthenticationService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      date: ['', [Validators.required]],
      branchId: [{ value: '', disabled: true }, Validators.required],
      userId: ['', Validators.required],
      total: [{ value: '', disabled: true }],
      invoiceDetails: this.fb.array([this.createDetail()])
    });
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user:any) => (
      this.user = user
      
    ));
    this.form.patchValue({
      branchId: this.user?.Branch?.id || null,
    });
    console.log("🚀 ~ FormComponent ~ ngOnInit ~ this.user:", this.user)

    this.servicesCrud.getAll().subscribe((services) => {
      this.serviceList = services;
    });

    this.productsCrud.getAll().subscribe((products) => {
      this.productList = products;
    });

    this.invoicesCrud.getUsers().subscribe((users) => {
      this.userList = users;
    });

    this.branchesCrud.getAll().subscribe((branches) => {
      this.branchList = branches;
    });
  }

  get invoiceDetails(): FormArray {
    return this.form.get('invoiceDetails') as FormArray;
  }

  createDetail(): FormGroup {
    return this.fb.group({
      serviceId: [''],
      productId: [''],
      quantity: ['', Validators.required],
      price: ['', Validators.required],
      subtotal: [{ value: '', disabled: true }, Validators.required]
    }, { validators: this.serviceOrProductValidator });
  }

  serviceOrProductValidator(group: FormGroup): { [key: string]: any } | null {
    const serviceId = group.get('serviceId').value;
    const productId = group.get('productId').value;

    if ((serviceId && productId) || (!serviceId && !productId)) {
      return { serviceOrProductRequired: true };
    }
    return null;
  }

  addDetail(): void {
    this.invoiceDetails.push(this.createDetail());
  }

  removeDetail(index: number): void {
    this.invoiceDetails.removeAt(index);
    this.updateTotal();
  }

  onServiceOrProductChange(index: number): void {
    const detail = this.invoiceDetails.at(index);
    const serviceId = detail.get('serviceId').value;
    const productId = detail.get('productId').value;

    if (serviceId) {
      detail.get('productId').setValue('');
      detail.get('productId').disable();
    } else if (productId) {
      detail.get('serviceId').setValue('');
      detail.get('serviceId').disable();
      detail.get('quantity').enable();
    } else {
      detail.get('quantity').enable();
    }

    this.updateSubtotal(index);
  }

  onProductOrServiceQuantityChange(index: number): void {
    const detail = this.invoiceDetails.at(index);
    const productId = detail.get('productId').value;
    const quantity = detail.get('quantity');

    if (quantity.value && quantity.value < 1) {
      quantity.setValue(1);
    }

    if (productId && quantity.value) {
      const product = this.productList.find(s => s.id.toString() === productId);
      if (quantity.value > product.quantity) {
        quantity.setValue(product.quantity);
      }
    }

    this.updateSubtotal(index);
  }

  updateSubtotal(index: number): void {
    const detail = this.invoiceDetails.at(index);
    const serviceId = detail.get('serviceId').value;
    const productId = detail.get('productId').value;
    const quantity = detail.get('quantity').value;
    const price = detail.get('price').value;

    let subtotal = 0;
    if (serviceId) {
      const service = this.serviceList.find(s => s.id.toString() === serviceId);
      if (service) {
        subtotal = quantity * service.price;
        detail.get('price').setValue(service.price);
      }
    } else if (productId) {
      const product = this.productList.find(p => p.id.toString() === productId);
      if (product) {
        subtotal = quantity * product.price;
        detail.get('price').setValue(product.price);
        if (quantity >= product.quantity) {
          detail.get('quantity').setValue(product.quantity);
          subtotal = product.quantity * product.price;
        }
      }
    }

    detail.get('subtotal').setValue(subtotal.toFixed(2));
    this.updateTotal();
  }

  updateTotal(): void {
    const total = this.invoiceDetails.controls.reduce((acc, detail) => {
      const subtotal = parseFloat(detail.get('subtotal').value || '0');
      return acc + subtotal;
    }, 0);

    this.form.get('total').setValue(total.toFixed(2));
  }

  getMaxQuantity(index: number): number {
    const detail = this.invoiceDetails.at(index);
    const productId = detail.get('productId').value;
    if (productId) {
      const product = this.productList.find(p => p.id.toString() === productId);
      return product ? product.quantity : 0;
    }
    return 0;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.invoiceDetails.controls.forEach(detail => detail.markAllAsTouched());
      this.noti.message('Form Error', 'Please correct the form errors.', messageType.error);
      return;
    }

    const formData = new FormData();
    formData.append('date', this.form.get('date')?.value);
    formData.append('branchId', this.form.get('branchId')?.value);
    formData.append('userId', this.form.get('userId')?.value);
    formData.append('total', this.form.get('total')?.value);

    this.invoiceDetails.controls.forEach((detail, index) => {
      formData.append(`invoiceDetails[${index}][serviceId]`, detail.get('serviceId')?.value);
      formData.append(`invoiceDetails[${index}][productId]`, detail.get('productId')?.value);
      formData.append(`invoiceDetails[${index}][quantity]`, detail.get('quantity')?.value);
      formData.append(`invoiceDetails[${index}][price]`, detail.get('price')?.value);
      formData.append(`invoiceDetails[${index}][subtotal]`, detail.get('subtotal')?.value);
    });

    this.invoicesCrud.create(formData).subscribe((data) => {
      this.noti.messageRedirect(
        'Create Invoice',
        `Invoice created successfully.`,
        messageType.success,
        '/invoices/list'
      );
    });
  }

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.form.get(controlName);
    if (control.errors) {
      for (const message of FormErrorMessage) {
        if (
          control.errors[message.forValidator] &&
          message.forControl == controlName
        ) {
          messageError = message.text;
        }
      }
      return messageError;
    } else {
      return false;
    }
  };

  public errorHandlingDetail = (index: number, controlName: string) => {
    let messageError = '';
    const control = this.invoiceDetails.at(index).get(controlName);
    if (control.errors) {
      for (const message of FormErrorMessage) {
        if (
          control.errors[message.forValidator] &&
          message.forControl == controlName
        ) {
          messageError = message.text;
        }
      }
      return messageError;
    } else {
      return false;
    }
  };

  onReset(): void {
    this.form.reset();
    this.invoiceDetails.clear();
    this.invoiceDetails.push(this.createDetail());
  }

  onBack(): void {
    this.router.navigate(['/invoices/table']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  openProductModal() {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      width: '600px',
      data: {
        items: this.productList, // Pasa la lista de productos al modal
        searchProps: ['name', 'price'], // Propiedades por las que quieres buscar
        displayProps: ['name', 'price'], // Propiedades que se mostrarán en el modal
        returnProp: 'id', // La propiedad que se devolverá al seleccionar un producto
        title: 'Products',
        multipleChoices: true // Cambia esto a true si quieres selección múltiple
      }
    });
  
    dialogRef.componentInstance.itemsSelected.subscribe(result => {
      console.log("🚀 ~ FormComponent ~ openProductModal ~ result:", result)
      if (result) {
          // Cuando se selecciona un solo ítem
          
        
        // Lógica adicional si es necesario
      }
    });
    
  }
  
}
