import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, switchMap, tap, catchError, of } from 'rxjs'; // Import BehaviorSubject, switchMap etc.
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model'; // Import User model

// Import the new components
import { ModalComponent } from '../../components/modal/modal.component';
import { EventFormComponent } from '../../components/event-form/event-form.component';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent, // Import ModalComponent
    EventFormComponent // Import EventFormComponent
  ],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.scss']
})
export class OrganizerDashboardComponent implements OnInit {

  // Use BehaviorSubject to trigger reloads
  private refreshEvents$ = new BehaviorSubject<void>(undefined);

  organizedEvents$: Observable<Event[]>;
  isLoading = true;
  error: string | null = null;

  // Modal State
  isEventModalOpen = false;
  isAttendeesModalOpen = false;
  modalTitle = '';
  selectedEventForEdit: Event | null = null;
  eventForAttendees: Event | null = null; // Store event whose attendees are being viewed
  attendeesToShow: User[] = [];
  isLoadingAttendees = false;
  attendeesError: string | null = null;

  // Form State
  isSubmittingEvent = false;
  eventFormError: string | null = null;


  constructor(private eventService: EventService) {
    // Pipe the refresh trigger through the event fetching logic
    this.organizedEvents$ = this.refreshEvents$.pipe(
        tap(() => this.isLoading = true), // Set loading true on each refresh
        switchMap(() => this.eventService.getMyOrganizedEvents()), // Fetch events
        tap(() => this.isLoading = false), // Set loading false on success
        catchError(err => { // Handle errors during fetch
            this.error = err.message || 'Failed to load organized events.';
            this.isLoading = false;
            console.error(err);
            return of([]); // Return empty array on error to prevent breaking the stream
        })
    );
  }

  ngOnInit(): void {
      // Initial load is triggered by BehaviorSubject's default value
  }

  // --- Event CRUD Modal Logic ---

  openCreateEventModal(): void {
    this.selectedEventForEdit = null; // Ensure edit mode is off
    this.modalTitle = 'Create New Event';
    this.eventFormError = null; // Clear previous errors
    this.isEventModalOpen = true;
  }

  openEditEventModal(event: Event): void {
    this.selectedEventForEdit = event; // Set event for editing
    this.modalTitle = `Edit Event: ${event.title}`;
    this.eventFormError = null; // Clear previous errors
    this.isEventModalOpen = true;
  }

  closeEventModal(): void {
    this.isEventModalOpen = false;
    this.selectedEventForEdit = null; // Clear selected event
    this.eventFormError = null;
  }

  handleEventFormSubmit(formData: Partial<Event>): void {
    this.isSubmittingEvent = true;
    this.eventFormError = null;
    let operation: Observable<Event | any>; // Use 'any' for delete response type flexibility

    if (this.selectedEventForEdit && formData.id) {
      // Update existing event
      operation = this.eventService.updateEvent(formData.id, formData);
    } else {
      // Create new event
      operation = this.eventService.createEvent(formData);
    }

    operation.subscribe({
      next: () => {
        this.isSubmittingEvent = false;
        this.closeEventModal();
        this.triggerRefresh(); // Refresh the event list
      },
      error: (err) => {
        this.isSubmittingEvent = false;
        this.eventFormError = err.message || 'Failed to save event.';
        console.error('Event form submission error:', err);
        // Keep modal open to show error
      }
    });
  }

  // --- Delete Event Logic ---

  deleteEvent(eventId: number | undefined, eventTitle: string | undefined): void {
     if (!eventId || !eventTitle) return;

     // Simple browser confirmation
     if (confirm(`Are you sure you want to delete the event "${eventTitle}"? This action cannot be undone.`)) {
        this.eventService.deleteEvent(eventId).subscribe({
            next: () => {
                console.log(`Event ${eventId} deleted successfully.`);
                this.triggerRefresh(); // Refresh the list
            },
            error: (err) => {
                this.error = err.message || `Failed to delete event ${eventId}.`; // Show error on main page for delete
                console.error(`Error deleting event ${eventId}:`, err);
            }
        })
     }
  }

  // --- View Attendees Modal Logic ---

  openAttendeesModal(event: Event): void {
    if (!event || !event.id) return;
    this.eventForAttendees = event;
    this.modalTitle = `Attendees for: ${event.title}`;
    this.attendeesToShow = []; // Clear previous attendees
    this.attendeesError = null;
    this.isLoadingAttendees = true;
    this.isAttendeesModalOpen = true;

    this.eventService.getEventAttendees(event.id).subscribe({
        next: (attendees) => {
            this.attendeesToShow = attendees;
            this.isLoadingAttendees = false;
        },
        error: (err) => {
             this.attendeesError = err.message || 'Failed to load attendees.';
             this.isLoadingAttendees = false;
             console.error('Error fetching attendees:', err);
        }
    });
  }

  closeAttendeesModal(): void {
    this.isAttendeesModalOpen = false;
    this.eventForAttendees = null;
    this.attendeesToShow = [];
    this.attendeesError = null;
  }

  // --- Helper to Refresh List ---
  triggerRefresh(): void {
    this.refreshEvents$.next(); // Emit void to trigger the BehaviorSubject pipe
  }
}