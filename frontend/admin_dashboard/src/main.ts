import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { initializeApp } from 'firebase/app';  // Import Firebase app initialization
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AuthInterceptor } from './app/auth.interceptor';

// Initialize Firebase globally
initializeApp(environment.firebaseConfig);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
