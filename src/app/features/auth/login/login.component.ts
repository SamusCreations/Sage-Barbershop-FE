import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification.service';
import { FormErrorMessage } from '../../../form-error-message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  form: FormGroup;
  currentUser: any;
  submitted = false; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private noti: NotificationService
  ) {
    this.reactiveForm();
    this.currentUser = null
  }

  ngOnInit(): void {}

  reactiveForm() {
    this.form = this.fb.group({
      email: [
        null,
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        null,
        Validators.compose([Validators.required]),
      ],
    });
  }

  public errorHandling = (controlName: string) => {
    let messageError = '';
    const control = this.form.get(controlName);

    // Mostrar errores solo si el formulario ha sido enviado
    if (this.submitted && control.errors) {
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
    this.submitted = true;
    if (this.form.invalid) {
      console.log('Invalid Form');
      this.noti.message(
        'Form Error',
        'Please correct the form errors.',
        messageType.error
      );
      return;
    }

    const loginData = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
    };

    this.authService
      .login(loginData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.authService.decodeToken.subscribe(
            (user: any) => (this.currentUser = user)
          );
          this.noti.messageRedirect(
            'Login Success',
            `Welcome ${this.currentUser.name}!`,
            messageType.success,
            '/home'
          );
          this.router.navigate(['/home']);
        },
        (error) => {
          this.noti.message(
            'Login Failed',
            'Invalid credentials. Please try again.',
            messageType.error
          );
        }
      );
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
