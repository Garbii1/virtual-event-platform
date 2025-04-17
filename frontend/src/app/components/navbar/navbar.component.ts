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

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));
    this.isOrganizer$ = this.currentUser$.pipe(map(user => !!user && user.is_organizer));
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']); // Redirect after logout
      },
      error: (err) => {
        console.error('Logout failed:', err);
        // Handle error display if needed
      }
    });
  }
}