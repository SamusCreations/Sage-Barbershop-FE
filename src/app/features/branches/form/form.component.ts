import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, takeUntil } from 'rxjs';
import { CrudBranchesService } from '../services/crud-branches.service';
import { NotificacionService, messageType } from '../../../shared/notification/notification.service';
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
  message = '';
  imageInfos?: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private crudService: CrudBranchesService,
    private noti: NotificacionService,
  ) {
    this.reactiveForm();
    this.getEmployeesWhithoutBranch();
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
              name: this.toUpdateObject.name,
              description: this.toUpdateObject.description,
              phone: this.toUpdateObject.phone,
              address: this.toUpdateObject.address,
              email: this.toUpdateObject.email,
              users: this.toUpdateObject.user.map(({ id }) => id),
            });

            // Obtener la lista de usuarios sin una branch relacionada
            this.crudService
              .getEmployeesWhithoutBranch()
              .pipe(takeUntil(this.destroy$))
              .subscribe((usersWithoutBranch) => {
                // Combinar ambas listas
                this.userList = [
                  ...usersWithoutBranch,
                  ...this.toUpdateObject.user,
                ];

                // Eliminar duplicados (en caso de que haya usuarios con y sin branch)
                this.userList = this.userList.filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex((t) => t.id === value.id)
                );

                console.log(this.userList);
              });
          });
      } else {
        // Obtener la lista de usuarios sin una branch relacionada si es creación
        this.getEmployeesWhithoutBranch();
      }
    });
  }

  reactiveForm() {
    this.form = this.fb.group({
      id: [null],
      name: [null, Validators.required],
      description: [null, [Validators.required, Validators.minLength(5)]],
      phone: [null, [Validators.required, Validators.pattern(/^\d{8,}$/)]],
      address: [null, Validators.required],
      email: [null, [Validators.required, Validators.email, this.emailDomainValidator('com')]],
      users: [null, [Validators.required, this.minSelectionValidator(1)]],
    });
  }

  emailDomainValidator(domain: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const email = control.value;
      const regex = new RegExp(`^[^@]+@[^@]+\\.${domain}$`);
      return regex.test(email) ? null : { 'emailDomain': { value: control.value } };
    };
  }

  minSelectionValidator(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      return value && value.length >= min ? null : { 'minSelection': { value: control.value } };
    };
  }

  getEmployeesWhithoutBranch() {
    this.userList = null;
    this.crudService
      .getEmployeesWhithoutBranch()
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
      this.noti.message('Form Error', 'Please correct the form errors.', messageType.error);
      return;
    }
    

    const formData = new FormData();
    formData.append('id', this.form.get('id')?.value);
    formData.append('name', this.form.get('name')?.value);
    formData.append('description', this.form.get('description')?.value);
    formData.append('phone', this.form.get('phone')?.value);
    formData.append('address', this.form.get('address')?.value);
    formData.append('email', this.form.get('email')?.value);
    const users = this.form.get('users')?.value;
    users.forEach((userId: number) => {
      formData.append('users', userId.toString());
    });

    // Print FormData to verify its content
    console.log(formData)
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
            'Create branch',
            `Branch created: ${data.name}`,
            messageType.success,
            '/branches/table'
          );
          this.router.navigate(['/branches/table']);
        });
    } else {
      this.crudService
        .update(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.createResponse = data;
          this.noti.messageRedirect(
            'Update branch',
            `Branch updated: ${data.name}`,
            messageType.success,
            '/branches/table'
          );
          this.router.navigate(['/branches/table']);
        });
    }
  }

  onReset() {
    this.form.reset();
  }

  onBack() {
    this.router.navigate(['/branches/table']);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
