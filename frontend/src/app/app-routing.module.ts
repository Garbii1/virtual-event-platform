// src/app/app-routing.module.ts
// Remove NgModule imports if no longer needed (RouterModule.forRoot is handled in app.config)
import { Routes } from '@angular/router';

// Import Components (they are standalone now)
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EventListComponent } from './pages/event-list/event-list.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { OrganizerDashboardComponent } from './pages/organizer-dashboard/organizer-dashboard.component';
import { MyRegistrationsComponent } from './pages/my-registrations/my-registrations.component';

// Import Functional Guards
import { authGuard } from './guards/auth.guard';
import { organizerGuard } from './guards/organizer.guard';

// Export the routes array directly
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Virtual Events - Home' },
  { path: 'login', component: LoginComponent, title: 'Login - Virtual Events' },
  { path: 'register', component: RegisterComponent, title: 'Register - Virtual Events' },
  { path: 'events', component: EventListComponent, title: 'Upcoming Events' },
  { path: 'events/:id', component: EventDetailComponent, title: 'Event Details' },

  // Protected Routes using functional guards
  {
    path: 'dashboard',
    component: OrganizerDashboardComponent,
    canActivate: [authGuard, organizerGuard], // Use functional guards
    title: 'Organizer Dashboard'
  },
  {
    path: 'my-registrations',
    component: MyRegistrationsComponent,
    canActivate: [authGuard], // Use functional guard
    title: 'My Registrations'
  },

  // Wildcard route
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

// --- Remove the @NgModule declaration ---
// @NgModule({
//   imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }