import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model'; // Create this model interface

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  // BehaviorSubject to hold the current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable(); // Expose as Observable

  constructor(private http: HttpClient) {
     this.checkInitialSession(); // Check session on service init
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Helper to get headers with credentials
  private getHttpOptions() {
      return {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          withCredentials: true // IMPORTANT: Send cookies with requests
      };
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData, this.getHttpOptions())
      .pipe(
        tap(user => console.log('Registration successful:', user)),
        catchError(this.handleError)
      );
  }

  login(credentials: any): Observable<{message: string, user: User}> {
    return this.http.post<{message: string, user: User}>(`${this.apiUrl}/login`, credentials, this.getHttpOptions())
      .pipe(
        tap(response => {
          console.log('Login successful:', response.user);
          this.currentUserSubject.next(response.user); // Update user state
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, this.getHttpOptions())
      .pipe(
        tap(() => {
          console.log('Logout successful');
          this.currentUserSubject.next(null); // Clear user state
        }),
        catchError(this.handleError)
      );
  }

  // Check if a session is active on the backend
  checkSessionStatus(): Observable<{ logged_in: boolean, user?: User }> {
      return this.http.get<{ logged_in: boolean, user?: User }>(`${this.apiUrl}/status`, this.getHttpOptions())
       .pipe(
           tap(response => {
               if (response.logged_in && response.user) {
                   this.currentUserSubject.next(response.user);
                   console.log("Session active:", response.user);
               } else {
                   this.currentUserSubject.next(null);
                   console.log("Session inactive");
               }
           }),
           catchError(err => {
               this.currentUserSubject.next(null); // Assume logged out on error
               console.error("Error checking session status:", err);
               return throwError(() => new Error('Session check failed')); // Rethrow or handle as needed
           })
       );
  }

   private checkInitialSession(): void {
       this.checkSessionStatus().subscribe(); // Subscribe to trigger the check
   }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isOrganizer(): boolean {
      return !!this.currentUserValue && this.currentUserValue.is_organizer;
  }

  private handleError(error: any): Observable<never> {
    console.error('AuthService API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.error || error.message}`;
    }
    // You might want to use a logging service here instead of console.error
    return throwError(() => new Error(errorMessage));
  }
}