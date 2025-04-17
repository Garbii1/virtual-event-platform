import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  isOrganizer$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  isMobileMenuOpen = false; // <-- Add state for mobile menu

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));
    this.isOrganizer$ = this.currentUser$.pipe(map(user => !!user && user.is_organizer));
  }

  ngOnInit(): void {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Close mobile menu when a link is clicked (optional but good UX)
  closeMobileMenu(): void {
      this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.isMobileMenuOpen = false; // Close menu on logout
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logout API call successful, redirecting...");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed in NavbarComponent:', err);
      }
    });
  }
}