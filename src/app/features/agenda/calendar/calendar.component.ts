import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CrudSchedulesService } from '../../schedules/services/crud-schedules.service';
import { Observer } from 'rxjs';
import { CrudReservationsService } from '../../reservations/services/crud-reservations.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { CrudBranchesService } from '../../branches/services/crud-branches.service';

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
  currentUser:any = {};
  selectedBranchId: any = null; // Guardar el branchId seleccionado

  calendarOptions: CalendarOptions = {};

  calendarRef: any; // Referencia al calendario

  showCalendar: boolean = false;
  branchList: any[] = [];

  constructor(
    private CrudScheduleService: CrudSchedulesService,
    private CrudReservationsService: CrudReservationsService,
    private authService: AuthenticationService,
    private CrudBranchService: CrudBranchesService
  ) {}

  async ngOnInit() {
    this.calendarOptions = {
      initialView: 'timeGridDay', // Vista de día por horas
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
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

    await this.authService.decodeToken.subscribe((user: any) => (this.currentUser = user));
    this.selectedBranchId = this.currentUser.branchId
    console.log("🚀 ~ CalendarComponent ~ ngOnInit ~ this.currentUser:", this.currentUser)
    await this.getAllBranches(); // Cargar las sucursales
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
        this.calendarRef?.getApi().refetchEvents(); // Refrescar los eventos
      },
      error: (error) => {
        console.error('Error al obtener datos de horarios', error);
      },
      complete: () => {
        console.log('Fetch schedules complete');
      }
    };
  
    if (this.selectedBranchId) {
      this.CrudScheduleService.findByBranch(this.selectedBranchId).subscribe(observer);
    }
  }
  
  async getAllReservations(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.reservations = data;
        this.reservations.forEach(element => {
          let name = element.User.name + ' ' + element.User?.surname;
          let color = element.status.color;
          let startDate = this.adjustToGMTMinus6(element.date);
          let endDate: any = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + 30);
          endDate = this.adjustToGMTMinus6(endDate);
          this.events.push({
            title: name,
            start: startDate,
            end: endDate,
            color: color,
            id: element.id.toString(),
            type: "Reservation"
          });
        });
        this.calendarRef?.getApi().refetchEvents(); // Refrescar los eventos
      },
      error: (error) => {
        console.error('Error al obtener datos de reservaciones', error);
      },
      complete: () => {
        console.log('Fetch reservations complete');
      }
    };
  
    if (this.selectedBranchId) {
      this.CrudReservationsService.findByBranch(this.selectedBranchId).subscribe(observer);
    }
  }
  
  async getAllBranches(): Promise<void> {
    const observer: Observer<any> = {
      next: (data) => {
        this.branchList = data;
        if (this.branchList.length > 0) {
          this.selectedBranchId = this.branchList[0].id;
          this.loadBranchData();
        }
      },
      error: (error) => {
        console.error('Error al obtener las sucursales', error);
      },
      complete: () => {
        console.log('Fetch branches complete');
      }
    };
  
    this.CrudBranchService.getAll().subscribe(observer);
  }
  

  // Método para cargar los datos de horarios y reservaciones
  async loadBranchData() {
    this.events = []; // Limpiar los eventos actuales
    await this.getAllSchedules();
    await this.getAllReservations();
  }

  onBranchChange(event: any) {
    this.selectedBranchId = event.target.value;
    this.loadBranchData(); // Cargar los datos de la sucursal seleccionada
  }
}
