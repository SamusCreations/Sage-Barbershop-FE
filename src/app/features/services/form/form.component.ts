import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, takeUntil } from 'rxjs';
import { CrudServicesService } from '../services/crud-services.service';
import { ImageService } from '../../../shared/image/image.service';
import {
  NotificacionService,
  messageType,
} from '../../../shared/notification/notification.service';
import { FormErrorMessage } from '../../../form-error-message';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  titleForm: string = 'Create';
  userList: any;
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
    private crudService: CrudServicesService,
    private noti: NotificacionService,
    private imageService: ImageService
  ) {
    this.reactiveForm();
    this.getEmployees();
  }

  ngOnInit(): void {
    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject != undefined) {
        this.isCreate = false;
        this.titleForm = 'Update';
        this.crudService
          .findById(this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.toUpdateObject = data;
            this.form.patchValue({
              id: this.toUpdateObject.id,
              name: this.toUpdateObject.name,
              description: this.toUpdateObject.description,
              price: this.toUpdateObject.price,
              duration: this.toUpdateObject.duration,
              user: this.toUpdateObject.userId,
            });
            this.nameImage = this.toUpdateObject.image;
            if (this.nameImage) {
              this.loadImagePreview(this.nameImage);
            }
          });
      }
    });
  }

  reactiveForm() {
    let number2decimals = /^[0-9]+[.,]{1,1}[0-9]{2,2}$/;
    this.form = this.fb.group({
      id: [null],
      name: [null, Validators.required],
      description: [null, [Validators.required, Validators.minLength(5)]],
      price: [null, Validators.required],
      duration: [null, Validators.required],
      image: [this.nameImage],
      user: [null, Validators.required],
    });
  }

  getEmployees() {
    this.userList = null;
    this.crudService
      .getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.userList = data;
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
      console.log(this.form.value);
      return;
    }

    const formData = new FormData();
    formData.append('id', this.form.get('id')?.value);
    formData.append('name', this.form.get('name')?.value);
    formData.append('description', this.form.get('description')?.value);
    formData.append(
      'price',
      parseFloat(this.form.get('price')?.value).toFixed(2)
    );
    formData.append('duration', this.form.get('duration')?.value);
    formData.append('user', this.form.get('user')?.value);

    if (this.currentFile) {
      formData.append('file', this.currentFile);
    }

    // Imprimir FormData para verificar el contenido
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    if (this.isCreate) {
      this.crudService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.createResponse = data;
          this.noti.messageRedirect(
            'Create service',
            `service created: ${data.name}`,
            messageType.success,
            '/services/table'
          );
          this.router.navigate(['/services/table']);
        });
    } else {
      this.crudService
        .update(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.createResponse = data;
          this.noti.messageRedirect(
            'Update service',
            `service updated: ${data.name}`,
            messageType.success,
            '/services/table'
          );
          this.router.navigate(['/services/table']);
        });
    }
  }

  onReset() {
    this.form.reset();
  }

  onBack() {
    this.router.navigate(['/services/table']);
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
        this.currentFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.preview = e.target.result;
        };
        reader.readAsDataURL(this.currentFile);
      }
    }
  }

  loadImagePreview(imageName: string): void {
    this.imageService.getImage(imageName, 300).subscribe(
      (imageBlob: Blob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        this.preview = objectURL;
      },
      (error) => {
        console.error('Error fetching image:', error);
      }
    );
  }
}
