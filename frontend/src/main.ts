// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Assuming you have or create app.config.ts
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig) // Use bootstrapApplication
  .catch((err) => console.error(err));