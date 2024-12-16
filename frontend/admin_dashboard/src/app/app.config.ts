import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Register the routes
    provideHttpClient(withInterceptors([AuthInterceptor])), // Register the interceptor
  ],
};
