// src/app/pages/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // ActivatedRoute for ID, Router for navigation, RouterModule for links
import { CommonModule } from '@angular/common'; // For *ngIf, pipes etc.
import { Observable, switchMap, catchError, of, tap, map } from 'rxjs';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service'; // To check login status
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-event-detail',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Needed for *ngIf, async pipe, date pipe etc.
    RouterModule // Needed for routerLink (e.g., back button)
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'] // Corrected from styleUrl if needed
})
export class EventDetailComponent implements OnInit { // Added OnInit
  event$: Observable<Event | null>;
  isLoading = true;
  error: string | null = null;
  isLoggedIn$: Observable<boolean>; // Check login status for registration button
  registrationMessage: string | null = null;
  registrationError: string | null = null;
  isRegistering = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private eventService: EventService,
    private authService: AuthService // Inject AuthService
  ) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map((user: User | null) => !!user)); // Get login status observable

    this.event$ = this.route.paramMap.pipe(
      tap(() => { // Reset state on new ID
         this.isLoading = true;
         this.error = null;
         this.registrationMessage = null;
         this.registrationError = null;
      }),
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.error = 'Event ID not found in URL.';
          this.isLoading = false;
          return of(null); // Return observable of null
        }
        const eventId = +idParam; // Convert string ID to number
        if (isNaN(eventId)) {
            this.error = 'Invalid Event ID.';
            this.isLoading = false;
            return of(null);
        }
        return this.eventService.getEvent(eventId).pipe(
          tap(() => this.isLoading = false), // Set loading false on success
          catchError(err => {
            this.error = err.message || `Failed to load event ${eventId}.`;
            this.isLoading = false;
            console.error(err);
            return of(null); // Return observable of null on error
          })
        );
      })
    );
  }

  ngOnInit(): void {
      // Subscription handled by async pipe or within constructor logic
  }

  register(eventId: number | undefined): void {
      if (!eventId) return;

      this.isRegistering = true;
      this.registrationMessage = null;
      this.registrationError = null;

      this.eventService.registerForEvent(eventId).subscribe({
          next: (response) => {
              this.isRegistering = false;
              this.registrationMessage = response.message || 'Successfully registered!';
              // Optionally refresh event data or navigate away
          },
          error: (err) => {
               this.isRegistering = false;
               this.registrationError = err.message || 'Registration failed.';
               console.error(err);
          }
      })
  }
}