import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, takeUntil } from 'rxjs';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { CrudServicesService } from '../../services/services/crud-services.service';
import { CrudUsersService } from '../../users/services/crud-users.service';
import { CrudSchedulesService } from '../../schedules/services/crud-schedules.service';
import { CrudInvoicesService } from '../../invoices/services/crud-invoices.service';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification.service';
import { FormErrorMessage } from '../../../form-error-message';
import { AuthenticationService } from '../../../shared/services/authentication.service';

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
  availableTimes: string[] = [];
  service: any | null = null; // Para mostrar la duración del servicio
  user: any | null = null; // Para mostrar la duración del servicio
  status: any;
  scheduleAvailable: boolean = true; // Para verificar si hay un horario disponible
  startHour: number = 0;
  endHour: number = 0;
  showModal: boolean = false;
  createSchedule: boolean = false;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private crudReservationsService: CrudReservationsService,
    private crudServicesService: CrudServicesService,
    private crudUsersService: CrudUsersService,
    private crudSchedulesService: CrudSchedulesService,
    private crudInvoicesService: CrudInvoicesService,
    private noti: NotificationService,
    private authService: AuthenticationService
  ) {
    this.reactiveForm();
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

    this.crudReservationsService
      .findStatusById(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        if (status) {
          this.status = status;
        }
      });

    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject !== undefined) {
        this.isCreate = false;
        this.titleForm = 'Update';

        // Obtener la reserva para actualizar
        this.crudReservationsService
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
      date: [
        null,
        Validators.compose([Validators.required, this.futureDateValidator()]),
      ],
      time: [{ value: null, disabled: true }, [Validators.required]], // Campo requerido y deshabilitado inicialmente
      answer1: ['no'], // Valor por defecto
      answer2: ['no'], // Valor por defecto
      answer3: ['no'], // Valor por defecto
      statusId: [1], // Estatus predeterminado en 1
      branchId: [null], // Campo no requerido
      serviceId: [null, Validators.required],
      userId: [null, Validators.required],
    });
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const currentDate = new Date();
      const controlDate = new Date(control.value);
      return controlDate < currentDate
        ? { invalidDate: { value: control.value } }
        : null;
    };
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

  onDateChange(event: any): void {
    const selectedDate = event.target.value;
    this.form.get('date')?.setValue(selectedDate);
    this.checkScheduleAndService(); // Verifica si el horario está disponible cuando se selecciona una fecha
  }

  onServiceChange(): void {
    const serviceId = this.form.get('serviceId')?.value;
    if (serviceId) {
      this.crudServicesService
        .findById(serviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((service) => {
          if (service) {
            this.service = service;
            this.checkScheduleAndService(); // Verifica si el horario está disponible cuando se selecciona un servicio
          } else {
            this.service = null;
            this.form.get('time')?.disable();
          }
        });
    }
  }

  onUserChange(): void {
    const userId = this.form.get('userId')?.value;
    if (userId) {
      this.crudUsersService
        .findById(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((user) => {
          if (user) {
            this.user = user;
          }
        });
    }
  }

  checkScheduleAndService(): void {
    let date = this.form.get('date')?.value;

    if (this.service && date) {
      this.crudSchedulesService
        .findByBranch(this.currentUser.branchId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (schedules) => {
            // Convertir la fecha seleccionada en un objeto Date sin horas
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);

            // Filtrar horarios que coincidan con la fecha seleccionada
            const matchingSchedule = schedules.find((schedule) => {
              const startDate = new Date(schedule.startDate);
              const endDate = new Date(schedule.endDate);

              // Eliminar horas para comparar solo las fechas
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);

              // Verificar si la fecha seleccionada está dentro del rango de fechas del horario
              return selectedDate >= startDate && selectedDate <= endDate;
            });

            console.log(matchingSchedule);

            if (matchingSchedule) {
              // Si se encontró un horario que coincide, obtener las horas de inicio y fin
              this.startHour = new Date(matchingSchedule.startDate).getHours();
              this.endHour = new Date(matchingSchedule.endDate).getHours();
              this.scheduleAvailable = true;
              this.calculateAvailableTimes(this.service.duration);
              this.form.get('time')?.enable();
            } else {
              // No se encontró un horario disponible para la fecha seleccionada
              this.scheduleAvailable = false;
              this.form.get('time')?.disable();
              this.errorMessage =
                'No schedule available for the selected date.';
              this.createSchedule = true;
              this.showModal = true; // Mostrar el modal cuando no hay horarios disponibles
            }
          },
          error: (errorResponse) => {
            this.scheduleAvailable = false;
            this.form.get('time')?.disable();
            this.errorMessage = errorResponse;
            this.showModal = true; // Mostrar el modal cuando hay un error al obtener los horarios
          },
        });
    } else {
      this.scheduleAvailable = false;
      this.form.get('time')?.disable();
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeModal();
  }

  calculateAvailableTimes(durationInMinutes: number): void {
    const intervals = [];
    let currentTime = new Date();
    currentTime.setHours(this.startHour, 0, 0, 0);

    while (currentTime.getHours() < this.endHour) {
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      intervals.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + durationInMinutes);
    }

    this.availableTimes = intervals;
  }

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
    formData.branchId = this.currentUser?.Branch?.id;

    // Combina date y time en un solo campo datetime
    let datetime = formData.date;
    datetime += `, ${formData.time}:00`;
    datetime = new Date(datetime);
    formData.datetime = datetime;

    // Print FormData to verify its content
    console.log(formData);

    const handleError = (error: any) => {
      // Mostrar el mensaje de error en el modal
      this.errorMessage = error.message || 'An error occurred';
      this.showModal = true;
    };

    const createInvoice = (reservationId: number) => {
      // Create FormData for the invoice
      const invoiceFormData = new FormData();
      invoiceFormData.append('date', datetime);
      invoiceFormData.append('branchId', formData.branchId);
      invoiceFormData.append('userId', formData.userId);
      invoiceFormData.append('total', this.service.price.toString());

      // Add invoice details
      invoiceFormData.append(
        'invoiceDetails[0][serviceId]',
        formData.serviceId
      );
      invoiceFormData.append('invoiceDetails[0][quantity]', '1');
      invoiceFormData.append(
        'invoiceDetails[0][price]',
        this.service.price.toString()
      );
      invoiceFormData.append(
        'invoiceDetails[0][subtotal]',
        this.service.price.toString()
      );

      this.crudInvoicesService
        .create(invoiceFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (invoiceData) => {
            console.log('Invoice created:', invoiceData);
            this.noti.messageRedirect(
              'Create Reservation and Invoice',
              `Reservation and invoice created: ${reservationId}`,
              messageType.success,
              '/reservations/table'
            );
            this.router.navigate(['/reservations/table']);
          },
          (error) => handleError(error)
        );
    };

    if (this.isCreate) {
      this.crudReservationsService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            createInvoice(data.id); // Pass reservation ID to create invoice
          },
          (error) => handleError(error)
        );
    } else {
      this.crudReservationsService
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
          (error) => handleError(error)
        );
    }
  }

  onReset() {
    this.form.reset({
      statusId: 1, // Reset al valor predeterminado
      answer1: 'no', // Reset al valor predeterminado
      answer2: 'no', // Reset al valor predeterminado
      answer3: 'no', // Reset al valor predeterminado
    });
    this.availableTimes = [];
    this.service = null; // Reset de la duración del servicio
    this.user = null; // Reset de la duración del servicio
    this.scheduleAvailable = true; // Reset de la disponibilidad de horario
    this.form.get('time')?.disable(); // Deshabilitar tiempo al reiniciar
  }

  loadOptions() {
    // Load branch, service, and user lists for form selection
    this.crudServicesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.serviceList = data));
    this.crudUsersService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.userList = data));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
