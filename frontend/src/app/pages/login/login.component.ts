// src/app/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, [ngClass]
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Needed for *ngIf, [ngClass]
    ReactiveFormsModule, // Needed for [formGroup], formControlName
    RouterModule // Needed for routerLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
       if(this.authService.isLoggedIn()) {
           this.router.navigate(['/']);
       }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.user.is_organizer) {
             this.router.navigate(['/dashboard']);
        } else {
             this.router.navigate(['/events']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Login failed.';
        console.error('Login error:', err);
      }
    });
  }

  get formControls() { return this.loginForm.controls; }
}