import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, takeUntil } from 'rxjs';
import { CrudReservationsService } from '../services/crud-reservations.service';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification/notification.service';
import { FormErrorMessage } from '../../../form-error-message';
import { AuthenticationService } from '../../../shared/services/authentication/authentication.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  titleForm: string = 'Create';
  serviceList: any;
  userList: any;
  toUpdateObject: any;
  createResponse: any;
  form: FormGroup;
  idObject: number = 0;
  isCreate: boolean = true;
  minDate: string;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private crudService: CrudReservationsService,
    private noti: NotificationService,
    private authService: AuthenticationService
  ) {
    this.reactiveForm();
    this.setMinDate();
  }

  ngOnInit(): void {
    // Subscripción a la información del usuario actual
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;

      // Set default branch from currentUser after user is loaded
      this.form.patchValue({
        branchId: this.currentUser?.Branch?.id || null,
      });
    });

    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject !== undefined) {
        this.isCreate = false;
        this.titleForm = 'Update';

        // Obtener la reserva para actualizar
        this.crudService
          .findById(this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.toUpdateObject = data;
            this.form.patchValue({
              id: this.toUpdateObject.id,
              date: this.toUpdateObject.date,
              time: this.toUpdateObject.time,
              answer1: this.toUpdateObject.answer1,
              answer2: this.toUpdateObject.answer2,
              answer3: this.toUpdateObject.answer3,
              statusId: this.toUpdateObject.status.id,
              branchId: this.toUpdateObject.branch.id,
              serviceId: this.toUpdateObject.service.id,
              userId: this.toUpdateObject.user.id,
            });
          });
      }

      // Cargar listas de opciones
      this.loadOptions();
    });
  }

  reactiveForm() {
    this.form = this.fb.group({
      id: [null],
      date: [null, [Validators.required]],
      time: [null, [Validators.required]], // Nuevo campo requerido
      answer1: ['no'], // Valor por defecto
      answer2: ['no'], // Valor por defecto
      answer3: ['no'], // Valor por defecto
      statusId: [1], // Estatus predeterminado en 1
      branchId: [null], // Campo no requerido
      serviceId: [null, Validators.required],
      userId: [null, Validators.required],
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
      this.noti.message(
        'Form Error',
        'Please correct the form errors.',
        messageType.error
      );
      return;
    }

    const formData = this.form.value;

    // Combina date y time en un solo campo datetime
    formData.datetime = `${formData.date}T${formData.time}:00`;

    // Print FormData to verify its content
    console.log(formData);

    if (this.isCreate) {
      this.crudService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            this.noti.messageRedirect(
              'Create Reservation',
              `Reservation created: ${data.id}`,
              messageType.success,
              '/reservations/table'
            );
            this.router.navigate(['/reservations/table']);
          },
          (error) => {
            this.noti.message('Create Error', error.message, messageType.error);
          }
        );
    } else {
      this.crudService
        .update(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            this.noti.messageRedirect(
              'Update Reservation',
              `Reservation updated: ${data.id}`,
              messageType.success,
              '/reservations/table'
            );
            this.router.navigate(['/reservations/table']);
          },
          (error) => {
            this.noti.message('Update Error', error.message, messageType.error);
          }
        );
    }
  }

  setMinDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const year = today.getFullYear();

    this.minDate = `${year}-${month}-${day}`;
  }

  onDateChange(event: any): void {
    const selectedDate = event.target.value;
    this.form.get('date')?.setValue(selectedDate);
  }

  onReset() {
    this.form.reset({
      statusId: 1, // Reset al valor predeterminado
      answer1: 'no', // Reset al valor predeterminado
      answer2: 'no', // Reset al valor predeterminado
      answer3: 'no', // Reset al valor predeterminado
    });
  }

  onBack() {
    this.router.navigate(['/reservations/table']);
  }

  loadOptions() {
    // Load branch, service, and user lists for form selection
    this.crudService
      .getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.serviceList = data));
    this.crudService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.userList = data));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
