// src/app/pages/my-registrations/my-registrations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor, *ngIf, etc.
import { RouterModule } from '@angular/router'; // For routerLink to view events
import { Observable } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-my-registrations',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Needed for *ngFor, *ngIf, async pipe
    RouterModule // Needed for routerLink
  ],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.scss'] // Corrected from styleUrl if needed
})
export class MyRegistrationsComponent implements OnInit { // Added OnInit
  registeredEvents$: Observable<Event[]>;
  isLoading = true;
  error: string | null = null;

  constructor(private eventService: EventService) {
      this.registeredEvents$ = this.eventService.getMyRegisteredEvents();
  }

   ngOnInit(): void {
    // Add loading/error handling
     this.registeredEvents$.subscribe({
        next: () => this.isLoading = false,
        error: (err) => {
            this.error = err.message || 'Failed to load registered events.';
            this.isLoading = false;
            console.error(err);
        }
    })
  }
}