// src/app/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, [ngClass] etc.
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    ReactiveFormsModule, // Needed for forms
    RouterModule // Needed for routerLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'] // Corrected from styleUrl if needed
})
export class RegisterComponent implements OnInit { // Added OnInit based on pattern
  registerForm: FormGroup; // Example form
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Example form setup - ADJUST TO YOUR ACTUAL NEEDS
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_organizer: [false] // Optional organizer flag
    });
  }

   ngOnInit(): void {
     // Redirect if already logged in
     if (this.authService.isLoggedIn()) {
       this.router.navigate(['/']);
     }
   }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const userData = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('Registration successful:', user);
        // Optionally login immediately or redirect to login page
        this.router.navigate(['/login'], { queryParams: { registrationSuccess: true } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Registration failed.';
        console.error('Registration error:', err);
      }
    });
  }

   get formControls() { return this.registerForm.controls; }
}