import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  currentUser: any;
  errorMessage: string;
  showModal: boolean;
  roles: { id: number, name: string }[] = [
    { id: 1, name: 'CLIENT' },
    { id: 2, name: 'EMPLOYEE' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private usersService: CrudUsersService,
    private noti: NotificationService,
    private authService: AuthenticationService
  ) {
    this.reactiveForm();
  }

  ngOnInit(): void {
    this.authService.decodeToken.subscribe((user: any) => {
      this.currentUser = user;
    });

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
              birthdate: this.toUpdateObject.birthdate,
              password: '', // Password should be handled separately
              role: this.toUpdateObject.role,
              branchId: this.toUpdateObject.branchId,
            });
          });
      }
    });
  }

  reactiveForm() {
    this.form = this.fb.group({
      id: [null],
      name: [null, Validators.required],
      surname: [null, Validators.required],
      phone: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [null, [Validators.required, Validators.email]],
      address: [null],
      birthdate: [null, Validators.required],
      password: [null, Validators.required],
      role: ['CLIENT'], // Default role
      branchId: [null],
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

  closeModal(): void {
    this.showModal = false;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeModal();
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
