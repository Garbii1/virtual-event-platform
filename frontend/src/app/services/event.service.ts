import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model'; // Create this model interface
import { User } from '../models/user.model'; // Might need user model too

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiUrl + '/events';
  private mainApiUrl = environment.apiUrl; // For routes outside /events

  constructor(private http: HttpClient) { }

   // Helper to get headers with credentials
  private getHttpOptions() {
      return {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          withCredentials: true // IMPORTANT: Send cookies with requests
      };
  }

  // Get all upcoming events
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Get a single event by ID
  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Create a new event (requires login/organizer role)
  createEvent(eventData: any): Observable<Event> {
    // Ensure dates are in ISO format string if they aren't already
    if (eventData.start_time instanceof Date) {
        eventData.start_time = eventData.start_time.toISOString();
    }
     if (eventData.end_time instanceof Date) {
        eventData.end_time = eventData.end_time.toISOString();
    }
    return this.http.post<Event>(this.apiUrl, eventData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Update an event (requires login/organizer role)
  updateEvent(id: number, eventData: any): Observable<Event> {
    if (eventData.start_time instanceof Date) {
        eventData.start_time = eventData.start_time.toISOString();
    }
     if (eventData.end_time instanceof Date) {
        eventData.end_time = eventData.end_time.toISOString();
    }
    return this.http.put<Event>(`${this.apiUrl}/${id}`, eventData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Delete an event (requires login/organizer role)
  deleteEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Register for an event (requires login)
  registerForEvent(eventId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${eventId}/register`, {}, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Unregister from an event (requires login)
  unregisterFromEvent(eventId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${eventId}/unregister`, {}, this.getHttpOptions())
     .pipe(catchError(this.handleError));
  }

  // Get events organized by the current user (requires login/organizer role)
  getMyOrganizedEvents(): Observable<Event[]> {
      return this.http.get<Event[]>(`${this.mainApiUrl}/my-events`, this.getHttpOptions())
       .pipe(catchError(this.handleError));
  }

  // Get events the current user is registered for (requires login)
  getMyRegisteredEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.mainApiUrl}/my-registrations`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // Get attendees for an event (requires login/organizer role)
   getEventAttendees(eventId: number): Observable<User[]> {
      return this.http.get<User[]>(`${this.apiUrl}/${eventId}/attendees`, this.getHttpOptions())
         .pipe(catchError(this.handleError));
   }


  private handleError(error: any): Observable<never> {
    console.error('EventService API Error:', error);
     let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.error || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}