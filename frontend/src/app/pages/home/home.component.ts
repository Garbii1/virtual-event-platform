// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, async pipe
import { RouterModule } from '@angular/router'; // For routerLink
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Needed for *ngIf, async pipe
    RouterModule // Needed for routerLink
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isOrganizer$: Observable<boolean>; // Declare the property

  constructor(public authService: AuthService) {
    // Derive isOrganizer$ from currentUser$
    this.isOrganizer$ = this.authService.currentUser$.pipe(
      map((user: User | null) => !!user && user.is_organizer) // Check user exists and is organizer
    );
  }
}