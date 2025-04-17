// src/app/guards/organizer.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Functional Guard
export const organizerGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService); // Inject AuthService
  const router = inject(Router); // Inject Router

  return authService.currentUser$.pipe(
    take(1),
    map(user => !!user && user.is_organizer), // Check if user exists AND is an organizer
    tap(isOrganizer => {
      if (!isOrganizer) {
        console.log('OrganizerGuard: Access denied - User is not an organizer');
        // Redirect to home or a 'not authorized' page
        router.navigate(['/']); // Or maybe '/unauthorized'
      }
    })
  );
};