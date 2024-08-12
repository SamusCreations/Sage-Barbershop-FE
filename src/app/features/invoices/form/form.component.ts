import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { CrudServicesService } from '../../services/services/crud-services.service';
import { CrudInvoicesService } from '../services/crud-invoices.service';
import { CrudProductsService } from '../../products/services/crud-products.service';
import { CrudBranchesService } from '../../branches/services/crud-branches.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  form: FormGroup;
  serviceList: any = [
    { id: '1', name: 'Service 1', price: 100 },
    { id: '2', name: 'Service 2', price: 200 }
  ];
  productList = [
    { id: '1', name: 'Product 1', quantity: 10, price: 50 },
    { id: '2', name: 'Product 2', quantity: 5, price: 75 }
  ];
  branchList = [
    { id: '1', name: 'Branch 1' },
    { id: '2', name: 'Branch 2' }
  ];
  userList = [
    { id: '1', name: 'User 1' },
    { id: '2', name: 'User 2' }
  ];
  titleForm = 'Create';

  constructor(
    private fb: FormBuilder,
    private servicesCrud: CrudServicesService,
    private invoicesCrud: CrudInvoicesService,
    private productsCrud: CrudProductsService,
    private branchesCrud: CrudBranchesService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      branchId: ['', Validators.required],
      userId: ['', Validators.required],
      total: [''],
      invoiceDetails: this.fb.array([this.createDetail()])
    });

    
  }



  async ngOnInit() {
    console.log(await this.servicesCrud.getAll())

    this.servicesCrud
    .getAll()
    .subscribe((services) => {
      this.serviceList = services
      console.log(services);
    });

    this.productsCrud
    .getAll()
    .subscribe((products) => {
      this.productList = products
      console.log(products);
    });

    this.invoicesCrud
    .getUsers()
    .subscribe((users) => {
      this.userList = users
      console.log(users);
    });


    this.branchesCrud
    .getAll()
    .subscribe((branches) => {
      this.branchList = branches
      console.log(branches);
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
      detail.get('quantity').setValue(1);
      detail.get('quantity').disable();

      
    } else if (productId) {
      detail.get('serviceId').setValue('');
      detail.get('serviceId').disable();
      detail.get('quantity').enable();

      
    } else {
      detail.get('quantity').enable();
    }

    this.updateSubtotal(index);
  }

  onProductOrServiceQuantityChange(index: number){
    const detail = this.invoiceDetails.at(index);
    const productId = detail.get('productId').value;
    const quantity = detail.get("quantity")
    console.log("🚀 ~ FormComponent ~ onProductOrServiceQuantityChange ~ quantity:", quantity.value)
    if(quantity.value && quantity.value < 1){
      quantity.setValue(1)
    }
    if(productId && quantity.value) {
      const product = this.productList.find(s => s.id.toString() === productId);
      if(quantity.value > product.quantity) {
        quantity.setValue(product.quantity)
      }
    }

    this.updateSubtotal(index)
  }

  updateSubtotal(index: number): void {
    console.log("l163")
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
      console.log("🚀 ~ FormComponent ~ updateSubtotal ~ productId:", productId)
      const product = this.productList.find(p => p.id.toString() === productId);
      console.log("🚀 ~ FormComponent ~ updateSubtotal ~ productList:", this.productList)
      console.log("🚀 ~ FormComponent ~ updateSubtotal ~ product:", product)
      if (product) {
        console.log("entra a producto")
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
    const productId = this.invoiceDetails.at(index).get('productId')?.value;
    const product = this.productList.find(p => p.id.toString() === productId);
    return product ? product.quantity : 0;
  }

  errorHandling(controlName: string): string {
    const control = this.form.get(controlName);
    if (control.hasError('required') && control.touched) {
      return 'This field is required';
    }
    return '';
  }

  errorHandlingDetail(index: number, controlName: string): string {
    const control = this.invoiceDetails.at(index).get(controlName);
    if (control.hasError('required') && control.touched) {
      return 'This field is required';
    }
    return '';
  }

  onReset(): void {
    this.form.reset();
    this.invoiceDetails.clear();
    this.invoiceDetails.push(this.createDetail());
  }



  submit(): void {
    if(this.form.valid) {
      console.log(this.form.value);
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      
      this.invoiceDetails.controls.forEach(detail => detail.markAllAsTouched());
      
      return;
    }
  }
}
