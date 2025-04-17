// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Import HttpClient providers
import { provideClientHydration } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import form modules if needed globally

import { routes } from './app-routing.module'; // Import routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Setup routing
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()), // Setup HttpClient
    importProvidersFrom(FormsModule, ReactiveFormsModule) // Import providers from modules
    // Add other global providers (like Guards, Interceptors) here using provide functions if available, or importProvidersFrom
  ]
};