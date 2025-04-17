// src/app/app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config'; // Import your main browser app config

// Merge the base app config with server-specific providers
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering() // Add provider for basic server rendering setup
    // Add any other server-only providers here if needed
  ]
};

// Export the merged configuration
export const config = mergeApplicationConfig(appConfig, serverConfig);