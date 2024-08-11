import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../../shared/services/authentication/authentication.service';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification/notification.service';
import { FormErrorMessage } from '../../../form-error-message';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  form: FormGroup;
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private noti: NotificationService
  ) {
    this.reactiveForm();
    this.setMaxDate();
  }

  ngOnInit(): void {}

  reactiveForm() {
    this.form = this.fb.group(
      {
        name: [null, Validators.required],
        surname: [null, Validators.required],
        email: [
          null,
          Validators.compose([Validators.required, Validators.email]),
        ],
        password: [
          null,
          Validators.compose([Validators.required, Validators.minLength(8)]),
        ],
        confirmPassword: [
          null,
          Validators.compose([Validators.required, Validators.minLength(8)]),
        ],
        birthdate: [null, Validators.required],
        phone: [null, [Validators.required, Validators.pattern(/^\d{8,}$/)]],
        address: [null, Validators.required],
      },
      {
        validator: this.passwordMatchValidator('password', 'confirmPassword'),
      }
    );
  }

  // Custom validator to check that two fields match
  passwordMatchValidator(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (confirmPasswordControl.errors && !confirmPasswordControl.errors['mustMatch']) {
        return;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ mustMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
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
    this.form.get('birthdate')?.setValue(selectedDate);
  }
  

  submit(): void {
    if (this.form.invalid) {
      console.log('Invalid Form');
      this.noti.message(
        'Form Error',
        'Please correct the form errors.',
        messageType.error
      );
      return;
    }

    const registerData = {
      name: this.form.get('name')?.value,
      surname: this.form.get('surname')?.value,
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      birthdate: this.form.get('birthdate')?.value,
      phone: this.form.get('phone')?.value,
      address: this.form.get('address')?.value,
    };

    this.authService
      .register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.noti.messageRedirect(
            'Registration Success',
            `Your account has been created successfully ${registerData.name}!`,
            messageType.success,
            '/auth/login'
          );
          this.router.navigate(['/auth/login']);
        },
        (error) => {
          this.noti.message(
            'Registration Failed',
            'There was an issue creating your account. Please try again.',
            messageType.error
          );
        }
      );
  }

  setMaxDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const year = today.getFullYear();

    this.maxDate = `${month}/${day}/${year}`;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  onReset() {
    this.form.reset();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
