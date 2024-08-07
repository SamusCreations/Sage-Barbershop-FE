import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, takeUntil } from 'rxjs';
import { CrudReservationsService } from '../services/crud-reservations.service';
import {
  NotificacionService,
  messageType,
} from '../../../shared/services/notification/notification.service';
import { FormErrorMessage } from '../../../form-error-message';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  titleForm: string = 'Create';
  branchList: any;
  toUpdateObject: any;
  createResponse: any;
  form: FormGroup;
  idObject: number = 0;
  isCreate: boolean = true;
  message = '';
  imageInfos?: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private crudService: CrudReservationsService,
    private noti: NotificacionService
  ) {
    this.reactiveForm();
  }

  ngOnInit(): void {
    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject != undefined) {
        this.isCreate = false;
        this.titleForm = 'Update';

        // Obtener la branch y su lista de usuarios relacionados
        this.crudService
          .findById(this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.toUpdateObject = data;
            this.form.patchValue({
              id: this.toUpdateObject.id,
              startDate: this.toUpdateObject.startDate,
              endDate: this.toUpdateObject.endDate,
              branchId: this.toUpdateObject.branchId,
              status: this.toUpdateObject.status,
            });
          });
      }
    });
  }

  reactiveForm() {
    this.form = this.fb.group({
      id: [null],
      startDate: [null, [Validators.required, this.futureDateValidator()]],
      endDate: [
        null,
        [
          Validators.required,
          this.futureDateValidator(),
          this.dateRangeValidator(),
        ],
      ],
      branchId: [null, Validators.required],
      status: [true, Validators.required],
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

  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const startDateControl = this.form?.get('startDate');
      const endDateControl = control;

      if (startDateControl && endDateControl) {
        const startDate = new Date(startDateControl.value);
        const endDate = new Date(endDateControl.value);

        if (!startDateControl.value || !endDateControl.value) {
          // If either date is not set, no validation error
          return null;
        }

        const minimumDifference = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        const isEndDateBeforeStartDate = endDate < startDate;
        const isLessThanMinimumDifference =
          endDate.getTime() - startDate.getTime() < minimumDifference;

        if (isEndDateBeforeStartDate) {
          return { dateMismatch: { value: control.value } };
        } else if (isLessThanMinimumDifference) {
          return { minDuration: { value: control.value } };
        }
      }

      return null;
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

    const formData = new FormData();
    formData.append('id', this.form.get('id')?.value);
    formData.append('startDate', this.form.get('startDate')?.value);
    formData.append('endDate', this.form.get('endDate')?.value);
    formData.append('branchId', this.form.get('branchId')?.value);
    formData.append('status', this.form.get('status')?.value);

    // Print FormData to verify its content
    console.log(formData);
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    if (this.isCreate) {
      this.crudService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            this.noti.messageRedirect(
              'Create schedule',
              `Schedule created: ${data.name}`,
              messageType.success,
              '/schedules/table'
            );
            this.router.navigate(['/schedules/table']);
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
              'Update schedule',
              `Schedule updated: ${data.name}`,
              messageType.success,
              '/schedules/table'
            );
            this.router.navigate(['/schedules/table']);
          },
          (error) => {
            this.noti.message('Update Error', error.message, messageType.error);
          }
        );
    }
  }

  toggleStatus() {
    const currentStatus = this.form.get('status')?.value;
    this.form.patchValue({ status: !currentStatus });
  }

  onReset() {
    this.form.reset();
  }

  onBack() {
    this.router.navigate(['/schedules/table']);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
