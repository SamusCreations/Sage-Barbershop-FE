import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GenericService } from '../../../shared/generic/generic.service';
import { HttpResponse } from '@angular/common/http';
import {
  NotificacionService,
  messageType,
} from '../../../shared/notification/notification.service';
import { FileUploadService } from '../../../shared/fileUpload/file.upload.service';
import { FormErrorMessage } from '../../../form-error-message';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  titleForm: string = 'Create';
  categoryList: any;
  toUpdateObject: any;
  createResponse: any;
  form: FormGroup;
  idObject: number = 0;
  isCreate: boolean = true;
  number4digits = /^\d{4}$/;
  currentFile?: File;
  message = '';
  preview = '';
  nameImage = 'image-not-found.jpg';
  imageInfos?: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private gService: GenericService,
    private noti: NotificacionService,
    private uploadService: FileUploadService
  ) {
    this.reactiveForm();
    this.Categories();
  }

  ngOnInit(): void {
    this.activeRouter.params.subscribe((params: Params) => {
      this.idObject = params['id'];
      if (this.idObject != undefined) {
        this.isCreate = false;
        this.titleForm = 'Update';
        this.gService
          .get('/product', this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            this.toUpdateObject = data;
            this.form.patchValue({
              id: this.toUpdateObject.id,
              name: this.toUpdateObject.name,
              description: this.toUpdateObject.description,
              image: this.toUpdateObject.image,
              price: this.toUpdateObject.price,
              quantity: this.toUpdateObject.quantity,
              category: this.toUpdateObject.category,
            });
            this.nameImage = this.toUpdateObject.image;
          });
      }
    });
  }

  reactiveForm() {
    let number2decimals = /^[0-9]+[.,]{1,1}[0-9]{2,2}$/;
    this.form = this.fb.group({
      id: [null, null],
      name: [null, Validators.required],
      description: [null, [Validators.required, Validators.minLength(5)]],
      price: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(number2decimals),
        ]),
      ],
      quantity: [null, Validators.required],
      image: [this.nameImage, Validators.required],
      category: [null, Validators.required],
    });
  }

  Categories() {
    this.categoryList = null;
    this.gService
      .list('/category')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.categoryList = data;
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

  submit(): void {
    if (this.form.invalid) {
      console.log('Invalid Form');
      console.log(this.form.value); // Ensure you are logging form values, not the form object
      return;
    }

    if (this.upload()) {
      this.noti.message('Create product', 'Image saved', messageType.success);
    }

    let categoryForm = this.form.get('category');
    let varPrice = parseFloat(this.form.get('price').value).toFixed(2);

    this.form.patchValue({
      category: categoryForm.value,
      price: varPrice,
      image: this.nameImage,
    });

    console.log(this.form.value);

    this.saveObject();
  }

  saveObject() {
    if (this.isCreate) {
      this.gService
        .create('/product', this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.createResponse = data;
          this.noti.messageRedirect(
            'Crear product',
            `product creado: ${data.name}`,
            messageType.success,
            '/products/table'
          );
          this.router.navigate(['/products/table']);
        });
    } else {
      this.gService
        .update('/product', this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.createResponse = data;
          this.noti.messageRedirect(
            'Actualizar product',
            `product actualizado: ${data.nombre}`,
            messageType.success,
            '/products/table'
          );
          this.router.navigate(['/products/table']);
        });
    }
  }

  onReset() {
    this.form.reset();
  }

  onBack() {
    this.router.navigate(['/products/table']);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);
      if (file) {
        this.preview = '';
        this.currentFile = file;
        // Rename the file
        const productName = this.form.get('name')?.value;
        const fileExtension = file.name.split('.').pop();
        const newFileName = `${productName}.${fileExtension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });

        this.currentFile = renamedFile;
        this.nameImage = this.currentFile.name;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.preview = e.target.result;
        };
        reader.readAsDataURL(this.currentFile);
      }
    }
  }

  upload(): boolean {
    if (this.currentFile) {
      this.uploadService.upload(this.currentFile).subscribe({
        next: (event: any) => {
          if (event instanceof HttpResponse) {
            this.message = event.body.message;
            this.imageInfos = this.uploadService.getFiles();
          }
          return true;
        },
        error: (err: any) => {
          console.log(err);
          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else {
            this.message = '¡No se pudo subir la imagen!';
            this.noti.message('Foto', this.message, messageType.warning);
          }
          return false;
        },
        complete: () => {
          this.currentFile = undefined;
        },
      });
    }
    return false;
  }
}
