import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CrudSchedulesService } from '../../schedules/services/crud-schedules.service';
import { Observer } from 'rxjs';
import { CrudReservationsService } from '../../reservations/services/crud-reservations.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  selectedEvent: any = null;
  showModal: boolean = false;

  schedules: any[] = [];
  reservations: any[] = [];
  events: any[] = [];

  calendarOptions: CalendarOptions = {};

  calendarRef: any; // Referencia al calendario

  constructor(
    private CrudScheduleService: CrudSchedulesService,
    private CrudReservationsService: CrudReservationsService
  ) {}

  ngOnInit() {
    this.calendarOptions = {
      initialView: 'timeGridDay', // Vista de día por horas
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridDay'
      },
      slotDuration: '00:30:00', // Duración de cada casilla (media hora)
      events: this.fetchEvents.bind(this), // Usamos una función para cargar los eventos
      eventClick: (info) => this.handleEventClick(info),

      eventTimeFormat: { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false // Esto mostrará la hora en formato de 24 horas
      }
    };

    // Obtenemos los horarios
    this.getAllSchedules();
    this.getAllReservations();
  }

  adjustToGMTMinus6(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 6); // Ajusta la fecha restando 6 horas
    return date.toISOString().slice(0, 19); // Recorta el formato ISO para eliminar la 'Z'
  }

  handleEventClick(info) {
    this.selectedEvent = info.event; // Capturar el evento seleccionado
    this.showModal = true; // Mostrar el modal
  }

  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
  }

  fetchEvents(info, successCallback, failureCallback) {
    // Esta función es llamada automáticamente por FullCalendar para cargar los eventos
    successCallback(this.events);
  }

  async getAllSchedules(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        console.log("🚀 ~ CalendarComponent ~ getAllSchedules ~ data:", data)
        this.schedules = data;
        this.schedules.forEach(element => {
          let name = "Block";
          let color = "rgba(255, 0, 0, 0.5)";
          if (element.status) {
            name = "Open";
            color = "rgba(0, 255, 0, 0.5)";
          }
          let startDate = this.adjustToGMTMinus6(element.startDate);
          let endDate = this.adjustToGMTMinus6(element.endDate);
          this.events.push({
            title: name,
            start: startDate,
            end: endDate,
            color: color,
            id: element.id.toString(),
            type: "Schedule"
          });
        });

        // Aquí usamos `refetchEvents` para actualizar los eventos
        // this.calendarRef.getApi().refetchEvents();
      },
      error: (error) => {
        console.error('Error al obtener datos de horarios', error);
      },
      complete: () => {
        console.log('Fetch schedules complete');
      },
    };

    this.CrudScheduleService.getAll().subscribe(observer);
  }

  async getAllReservations(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        console.log("🚀 ~ CalendarComponent ~ getAllSchedules ~ data:", data)
        this.reservations = data;
        console.log("🚀 ~ CalendarComponent ~ getAllReservations ~ this.reservations:", this.reservations)
        this.reservations.forEach(element => {
          let name = element.User.name + ' ' + element.User?.surname;
          let color = element.status.color;

          let startDate = this.adjustToGMTMinus6(element.date);
          let endDate:any = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + 30);
          endDate = this.adjustToGMTMinus6(endDate)
          console.log("🚀 ~ CalendarComponent ~ getAllReservations ~ endDate:", endDate)
          this.events.push({
            title: name,
            start: startDate,
            end: endDate,
            color: color,
            id: element.id.toString(),
            type: "Reservation"
          });
        });
          

        // Aquí usamos `refetchEvents` para actualizar los eventos
        // this.calendarRef.getApi().refetchEvents();
      },
      error: (error) => {
        console.error('Error al obtener datos de horarios', error);
      },
      complete: () => {
        console.log('Fetch schedules complete');
      },
    };

    this.CrudReservationsService.getAll().subscribe(observer);
  }
}
