import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { CrudServicesService } from '../../services/services/crud-services.service';
import { CrudUsersService } from '../../users/services/crud-users.service';
import { CrudSchedulesService } from '../../schedules/services/crud-schedules.service';
import { CrudInvoicesService } from '../../invoices/services/crud-invoices.service';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification.service';
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
  service: any | null = null;
  user: any | null = null;
  status: any;
  scheduleAvailable: boolean = true;
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
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
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
      this.loadOptions();
    });
  }

  reactiveForm() {
    this.form = this.fb.group({
      id: [null],
      date: [null, Validators.compose([Validators.required, this.futureDateValidator()])],
      time: [{ value: null, disabled: true }, [Validators.required]],
      answer1: ['no'],
      answer2: ['no'],
      answer3: ['no'],
      statusId: [1],
      branchId: [null],
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
      if (control.errors['required']) {
        return `${controlName} is required.`;
      }
      return 'Invalid input';
    }
    return false;
  };

  onDateChange(event: any): void {
    const selectedDate = event.target.value;
    this.form.get('date')?.setValue(selectedDate);
    if (this.form.get('serviceId')?.value) {
      this.checkScheduleAndService();
    }
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
            if (this.form.get('date')?.value) {
              this.checkScheduleAndService();
            }
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
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            const matchingSchedule = schedules.find((schedule) => {
              const startDate = new Date(schedule.startDate);
              const endDate = new Date(schedule.endDate);
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);
              return selectedDate >= startDate && selectedDate <= endDate;
            });
            if (matchingSchedule) {
              this.startHour = new Date(matchingSchedule.startDate).getHours();
              this.endHour = new Date(matchingSchedule.endDate).getHours();
              this.scheduleAvailable = true;
              this.calculateAvailableTimes(this.service.duration);
              this.form.get('time')?.enable();
            } else {
              this.scheduleAvailable = false;
              this.form.get('time')?.disable();
              this.errorMessage = 'No schedule available for the selected date.';
              this.createSchedule = true;
              this.showModal = true;
            }
          },
          error: (errorResponse) => {
            this.scheduleAvailable = false;
            this.form.get('time')?.disable();
            this.errorMessage = errorResponse;
            this.showModal = true;
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

  navigateTo(path: string): void {
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
      this.noti.message('Form Error', 'Please correct the form errors.', messageType.error);
      return;
    }
  
    const formData = this.form.value;
  
    // Obtener la fecha y hora seleccionadas del formulario en la zona horaria local
    const [year, month, day] = formData.date.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
  
    // Crear la fecha en la zona horaria local
    const localDateTime = new Date(year, month - 1, day, hours, minutes);
  
    // Convertir la fecha local a UTC utilizando los métodos correctos
    const utcDateTime = new Date(localDateTime.toISOString()); 
  
    // Actualizar formData.datetime con la fecha y hora en UTC para enviarlo al backend
    formData.datetime = utcDateTime.toISOString();

    const date = utcDateTime.toISOString().split('T')[0];
    const time = utcDateTime.toISOString().split('T')[1].split('.')[0].slice(0, 5);

    formData.time = time
    formData.date = date
  
    // Validar los datos antes de enviarlos
    console.log('Form Data before submission:', formData);
  
    const handleError = (error: any) => {
      this.errorMessage = error.message || 'An error occurred';
      this.showModal = true;
    };
  
    if (this.isCreate) {
      this.crudReservationsService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            this.noti.messageRedirect(
              'Create Reservation',
              `Reservation created successfully: ${data.id}`,
              messageType.success,
              '/reservations/table'
            );
            this.router.navigate(['/reservations/table']);
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
              `Reservation updated successfully: ${data.id}`,
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
      statusId: 1,
      answer1: 'no',
      answer2: 'no',
      answer3: 'no',
    });
    this.availableTimes = [];
    this.service = null;
    this.user = null;
    this.scheduleAvailable = true;
    this.form.get('time')?.disable();
  }

  loadOptions() {
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
