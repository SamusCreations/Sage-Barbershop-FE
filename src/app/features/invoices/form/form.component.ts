import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CrudServicesService } from '../../services/services/crud-services.service';
import { CrudInvoicesService } from '../services/crud-invoices.service';
import { CrudProductsService } from '../../products/services/crud-products.service';
import { CrudBranchesService } from '../../branches/services/crud-branches.service';
import { NotificationService, messageType } from '../../../shared/services/notification.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchModalComponent } from '../../../shared/components/search-modal/search-modal.component';
import { FormErrorMessage } from '../../../form-error-message';

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
  invalidFormSubmitted: boolean = false

  objectId: string
  updateObject: any
  isUpdate: boolean = false

  user: any

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicesCrud: CrudServicesService,
    private invoicesCrud: CrudInvoicesService,
    private productsCrud: CrudProductsService,
    private branchesCrud: CrudBranchesService,
    private noti: NotificationService,
    private activeRouter: ActivatedRoute,
    private authService: AuthenticationService,
    private dialog: MatDialog
  ) {

    const today = new Date().toISOString().split('T')[0];


    this.form = this.fb.group({
      date: [today, [Validators.required]],
      branchId: [{ value: '', disabled: true }, Validators.required],
      userId: ['', Validators.required],
      total: [{ value: 0.00, disabled: true }],
      invoiceDetails: this.fb.array([], this.minItemsValidator(1))
    });


    

    
  }

  async ngOnInit() {
    this.authService.decodeToken.subscribe((user: any) => (this.user = user));
    this.form.patchValue({
      branchId: this.user?.Branch?.id || null
    });

    await this.servicesCrud.getAll().subscribe((services) => (this.serviceList = services));
    await this.productsCrud.getAll().subscribe((products) => (this.productList = products));
    await this.invoicesCrud.getUsers().subscribe((users) => (this.userList = users));
    await this.branchesCrud.getAll().subscribe((branches) => (this.branchList = branches));


    this.activeRouter.params.subscribe((params) => {
      this.objectId = params['id'];
      if (this.objectId != undefined) {
        this.isUpdate = true;
        this.titleForm = 'Update';
        this.invoicesCrud
          .findById(parseInt(this.objectId))
          .subscribe((data) => {
            this.updateObject = data[0];
            this.form.patchValue({
              date: new Date(this.updateObject.date).toISOString().split('T')[0],
              userId: this.updateObject.userId
            });


            if(this.updateObject.InvoiceDetail && this.updateObject.InvoiceDetail.length > 0){
              
              this.updateObject.InvoiceDetail.forEach(element => {
                this.addDetail(this.createDetail(element.serviceId, element.productId, element.quantity))
              });
            }
            
          });

          this.form.get('date')?.disable();
          this.form.get('userId')?.disable();
      }
    });
  }


  //Form actions

  createDetail(serviceId?: string, productId?: string, quantity: number = 0): FormGroup {
    let price = 0
    let subTotal = 0
    if (serviceId) {
      const service = this.serviceList.find((s) => s.id.toString() === serviceId.toString());
      price = parseFloat(service.price)
      if(quantity) subTotal = parseFloat(service.price) * quantity
    } else if (productId) {
      const product = this.productList.find((s) => s.id.toString() === productId.toString());
      price = parseFloat(product.price)
      if(quantity) subTotal = parseFloat(product.price) * quantity
      
    }

    return this.fb.group(
      {
        serviceId: [serviceId || ''],
        productId: [productId || ''],
        quantity: [quantity, Validators.required],
        price: [price, Validators.required],
        subtotal: [{ value: subTotal, disabled: true }, Validators.required]
      },
      { validators: this.serviceOrProductValidator }
    );
  }

  addDetail(form? : FormGroup): void {
    if(form) {
      this.invoiceDetails.push(form);
    }else {
      this.invoiceDetails.push(this.createDetail());
    }
    this.updateTotal()
  }

  removeDetail(index: number): void {
    this.invoiceDetails.removeAt(index);
    this.updateTotal();
  }

  openLineModal(index?: number): void {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      width: '600px',
      data: {
        lists: [
          { list: this.productList, name: 'Products' },
          { list: this.serviceList, name: 'Services' }
        ],
        searchProps: ['name', 'price'],
        displayProps: ['name', 'price'],
        returnProp: 'id',
        title: 'Select a Product or Service',
        multipleChoices: false,
        multipleLists: true
      }
    });
  
    dialogRef.componentInstance.itemSelected.subscribe((result) => {
      if (result) {
        // Crear un nuevo detalle y añadirlo al array
        const detailFormGroup = this.createDetail();
  
        // Setear valores seleccionados
        let price = 0;
        if (result.listFrom === 'Products') {
          const product = this.productList.find((p) => p.id === result.id);
          price = product.price;
          detailFormGroup.patchValue({
            productId: result.id,
            serviceId: '',
            price: price
          });
          detailFormGroup.get('serviceId')?.disable();
        } else if (result.listFrom === 'Services') {
          const service = this.serviceList.find((s) => s.id === result.id);
          price = service.price;
          detailFormGroup.patchValue({
            serviceId: result.id,
            productId: '',
            price: price
          });
          detailFormGroup.get('productId')?.disable();
        }
  
        // Agregar el nuevo detalle al array del formulario
        this.invoiceDetails.push(detailFormGroup);
  
        this.updateSubtotal(this.invoiceDetails.length - 1);
      }
    });
  }
  
  openUserModal(): void {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      width: '600px',
      data: {
        lists: [{ list: this.userList, name: 'Users' }],
        searchProps: ['name', 'surname'],
        displayProps: ['name', 'surname'],
        returnProp: 'id',
        title: 'Select a User',
        multipleChoices: false,
        multipleLists: false
      }
    });

    dialogRef.componentInstance.itemSelected.subscribe((result) => {
      if (result) {
        this.form.get('userId')?.setValue(result.id);
        this.form.get('userId')?.markAsTouched();
      }
    });
  }

  onProductOrServiceQuantityChange(index: number): void {
    const detail = this.invoiceDetails.at(index);
    const productId = detail.get('productId').value;
    const serviceId = detail.get('serviceId').value;
    const quantity = detail.get('quantity').value;

    if (quantity && quantity < 1) {
      detail.get('quantity').setValue(1);
    }

    if ((productId || serviceId) && quantity) {
      let itemQuantity = 0
      if (productId) {
        const product = this.productList.find((p) => p.id === productId);
        itemQuantity = product.quantity
      } else if (serviceId) {
        const service = this.serviceList.find((p) => p.id === serviceId);
        itemQuantity = service.quantity
      }

      if (quantity > itemQuantity) {
        detail.get('quantity').setValue(itemQuantity);
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
      const service = this.serviceList.find((s) => s.id === serviceId);
      if (service) {
        subtotal = quantity * service.price;
        detail.get('price').setValue(service.price);
      }
    } else if (productId) {
      const product = this.productList.find((p) => p.id === productId);
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


  submit(): void {
    if (this.form.invalid) {
      this.invalidFormSubmitted = true
      this.form.markAllAsTouched();
      this.invoiceDetails.controls.forEach((detail) => detail.markAllAsTouched());
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

    if(!this.isUpdate) {
      this.invoicesCrud.create(formData).subscribe((data) => {
        this.noti.messageRedirect('Create Invoice', `Invoice created successfully.`, messageType.success, '/invoices/list');
      });
    }else {
      formData.append('id', this.objectId);
      this.invoicesCrud.update(formData).subscribe((data) => {
        this.noti.messageRedirect('Update Invoice', `Invoice Updated successfully.`, messageType.success, '/invoices/list');
      });
    }
    

    
  }

  onReset(): void {
    this.form.reset();
    this.invoiceDetails.clear();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  markAsInvoice(id: number): void {
    this.invoicesCrud.setAsInvoice(id).subscribe({
      next: (response) => {
        this.noti.messageRedirect('Mark as Pais', `Invoice paid successfully.`, messageType.success, '/invoices/list');
        console.log('Invoice status updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating invoice status:', error);
      },
    });
  }

  //Validators

  private minItemsValidator(minItems: number) {
    return (formArray: FormArray): { [key: string]: any } | null => {
      return formArray.length >= minItems ? null : { minItems: { minItems, actual: formArray.length } };
    };
  }
  private serviceOrProductValidator(group: FormGroup): { [key: string]: any } | null {
    const serviceId = group.get('serviceId').value;
    const productId = group.get('productId').value;

    if ((serviceId && productId) || (!serviceId && !productId)) {
      return { serviceOrProductRequired: true };
    }
    return null;
  }
  areInvoiceDetailsValid(): boolean {
    return this.invoiceDetails.controls.every((detail) => detail.valid);
  }


  //Gets

  get invoiceDetails(): FormArray {
    return this.form.get('invoiceDetails') as FormArray;
  }

  getUserName(userId: string): string {
    const user = this.userList.find((u) => u.id === userId);
    return user ? `${user.name} ${user.surname}` : 'Select a user';
  }

  getServiceName(serviceId: string): string {
    const service = this.serviceList.find((s) => s.id === serviceId);
    return service ? service.name : '';
  }

  getProductName(productId: string): string {
    const product = this.productList.find((p) => p.id === productId);
    return product ? product.name : '';
  }

  getMaxQuantity(index: number): number {
    const detail = this.invoiceDetails.at(index);
    const productId = detail.get('productId').value;
    if (productId) {
      const product = this.productList.find((p) => p.id.toString() === productId);
      return product ? product.quantity : 0;
    }
    return 0;
  }


  //Error Handlings

  public errorHandling(controlName: string): string {
    const control = this.form.get(controlName);
    let messageError = '';

    if (control && control.errors) {
      for (const message of FormErrorMessage) {
        if (control.errors[message.forValidator] && message.forControl === controlName) {
          messageError = message.text;
        }
      }
    }

    return messageError;
  }

  public errorHandlingDetail(index: number, controlName: string): string {
    const control = this.invoiceDetails.at(index).get(controlName);
    let messageError = '';

    if (control && control.errors) {
      for (const message of FormErrorMessage) {
        if (control.errors[message.forValidator] && message.forControl === controlName) {
          messageError = message.text;
        }
      }
    }

    return messageError;
  }

}


