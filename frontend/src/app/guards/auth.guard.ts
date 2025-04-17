// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Functional Guard
export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService); // Inject AuthService
  const router = inject(Router); // Inject Router

  return authService.currentUser$.pipe(
    take(1), // Take the current value and complete
    map(user => !!user), // Map to boolean indicating if user exists
    tap(isLoggedIn => {
      if (!isLoggedIn) {
        console.log('AuthGuard: Access denied - User not logged in');
        // Redirect to login page, passing the attempted url
        router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      }
    })
  );
};