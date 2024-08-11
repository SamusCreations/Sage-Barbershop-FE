import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudSchedulesService } from '../services/crud-schedules.service';
import { Subject, takeUntil } from 'rxjs';
import {
  NotificationService,
  messageType,
} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  schedule: any = null;
  charging: boolean = true;
  idObject: number = 0;

  constructor(
    private activeRouter: ActivatedRoute,
    private crudService: CrudSchedulesService,
    private noti: NotificationService
  ) {}

  ngOnInit(): void {
    this.activeRouter.params.subscribe((params) => {
      this.idObject = params['id'];
      if (this.idObject != undefined) {
        this.crudService
          .findById(this.idObject)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
              this.schedule = data;
              this.charging = false;
            },
            (error) => {
              console.error('Error fetching product details:', error);
              this.noti.message(
                'Error',
                `An error occurred: ${error.message}`,
                messageType.error
              );
              this.charging = false;
            }
          );
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
