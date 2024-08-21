import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CrudUsersService } from '../services/crud-users.service';
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
  toUpdateObject: any;
  createResponse: any;
  form: FormGroup;
  idObject: number = 0;
  isCreate: boolean = true;
  errorMessage: string;
  showModal: boolean;
  roles: { id: string; name: string }[] = [
    { id: 'CLIENT', name: 'Client' },
    { id: 'EMPLOYEE', name: 'Employee' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private usersService: CrudUsersService,
    private noti: NotificationService
  ) {
    this.reactiveForm();
  }

  ngOnInit(): void {
    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject !== undefined) {
        this.isCreate = false;
        this.titleForm = 'Update';

        this.usersService
          .findById(this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.toUpdateObject = data;
            this.form.patchValue({
              id: this.toUpdateObject.id,
              name: this.toUpdateObject.name,
              surname: this.toUpdateObject.surname,
              phone: this.toUpdateObject.phone,
              email: this.toUpdateObject.email,
              address: this.toUpdateObject.address,
              birthdate: this.toUpdateObject.birthdate.split('T')[0], // Formatear fecha para que se muestre correctamente
              role: this.toUpdateObject.role,
            });

            // Remove validators for password fields when updating
            this.form.get('password')?.clearValidators();
            this.form.get('confirmPassword')?.clearValidators();
            this.form.get('password')?.updateValueAndValidity();
            this.form.get('confirmPassword')?.updateValueAndValidity();
          });
      }
    });
  }

  reactiveForm() {
    this.form = this.fb.group(
      {
        id: [null, null],
        name: [null, Validators.required],
        surname: [null, Validators.required],
        email: [
          null,
          Validators.compose([Validators.required, Validators.email]),
        ],
        password: [
          null,
          this.isCreate
            ? Validators.compose([Validators.required, Validators.minLength(8)])
            : Validators.nullValidator, // No validator for update
        ],
        confirmPassword: [
          null,
          this.isCreate
            ? Validators.compose([Validators.required, Validators.minLength(8)])
            : Validators.nullValidator, // No validator for update
        ],
        birthdate: [null, [Validators.required, this.dateValidator]],
        phone: [null, [Validators.required, Validators.pattern(/^\d{8,}$/)]],
        address: [null, Validators.required],
        role: [null, Validators.required],
      },
      {
        validator: this.isCreate
          ? this.passwordMatchValidator('password', 'confirmPassword')
          : Validators.nullValidator, // No validator for update
      }
    );
  }

  // Custom validator to check that two fields match
  passwordMatchValidator(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (
        confirmPasswordControl.errors &&
        !confirmPasswordControl.errors['mustMatch']
      ) {
        return;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ mustMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }
  // Validator to check if birthdate is in the past
  dateValidator(control: AbstractControl) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    if (selectedDate >= today) {
      return { invalidDate: true };
    }
    return null;
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

  closeModal(): void {
    this.showModal = false;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeModal();
  }

  submit(): void {
    if (this.form.invalid) {
      this.noti.message(
        'Form Error',
        'Please correct the form errors.',
        messageType.error
      );
      this.errorMessage = 'Please correct the form errors.';
      this.showModal = true;
      return;
    }

    const formData = this.form.value;
    console.log(formData);

    if (this.isCreate) {
      this.usersService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            this.noti.messageRedirect(
              'Create User',
              `User created: ${data.id}`,
              messageType.success,
              '/users/table'
            );
            this.router.navigate(['/users/table']);
          },
          (error) => {
            this.errorMessage = error.message || 'An error occurred';
            this.showModal = true;
          }
        );
    } else {
      this.usersService
        .update(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.createResponse = data;
            this.noti.messageRedirect(
              'Update User',
              `User updated: ${data.id}`,
              messageType.success,
              '/users/table'
            );
            this.router.navigate(['/users/table']);
          },
          (error) => {
            this.errorMessage = error.message || 'An error occurred';
            this.showModal = true;
          }
        );
    }
  }

  onReset() {
    this.form.reset({
      role: 'CLIENT', // Reset to default value
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
