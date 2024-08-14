import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudReservationsService } from '../services/crud-reservations.service';
import { Location } from '@angular/common';
import {
  messageType,
  NotificationService,
} from '../../../shared/services/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  reservation: any = null;
  charging: boolean = true;
  idObject: number = 0;

  constructor(
    private activeRouter: ActivatedRoute,
    private crudService: CrudReservationsService,
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
              this.reservation = data;
              this.charging = false;
            },
            (error) => {
              console.error('Error fetching reservation details:', error);
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
