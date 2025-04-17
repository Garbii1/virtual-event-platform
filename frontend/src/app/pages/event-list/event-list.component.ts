// src/app/pages/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor, async pipe, etc.
import { RouterModule } from '@angular/router'; // For routerLink
import { Observable } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model'; // Use your Event model

@Component({
  selector: 'app-event-list',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Needed for *ngFor, async pipe
    RouterModule // Needed for routerLink
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'] // Corrected from styleUrl if needed
})
export class EventListComponent implements OnInit { // Added OnInit
  events$: Observable<Event[]>;
  isLoading = true;
  error: string | null = null;

  constructor(private eventService: EventService) {
    this.events$ = this.eventService.getEvents(); // Assign observable directly
  }

  ngOnInit(): void {
    // Subscription can happen automatically via async pipe in template
    // Add error/loading handling if needed without async pipe
    this.events$.subscribe({
        next: () => this.isLoading = false,
        error: (err) => {
            this.error = err.message || 'Failed to load events.';
            this.isLoading = false;
            console.error(err);
        }
    })
  }
}