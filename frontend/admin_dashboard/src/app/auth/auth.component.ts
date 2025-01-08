// src/app/auth.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  browserSessionPersistence,
  AuthError,
  Auth,
  setPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { LoadingComponent } from '../components/loading/loading.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  private firebaseApp: FirebaseApp;
  private auth: Auth = getAuth();
  public loading: boolean = false;

  // Store email and password input fields in the component
  email: string | null = ''; //provided by Authservice
  password: string = '';
  user: any = null; //holds authenticated user

  passwordResetEmail: string = '';

  // Messages
  errorAuthentication = '';
  errorLoggedOut = '';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService
  ) {
    // Initialize Firebase with your Firebase configuration
    this.firebaseApp = initializeApp(environment.firebaseConfig);
  }

  async ngOnInit() {
    this.loading = true;

    // Subscribe to email$ observable
    this.authService.email$.subscribe((email) => {
      this.email = email;
      this.changeDetectorRef.detectChanges();
    });

    // Auth state change handling
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, update the state with the user information
        this.email = user.email;
        this.changeUser(user);
      } else {
        // No user is signed in, handle accordingly
        this.changeUser(null);
      }
      // Set loading to false after processing the auth state change
      this.loading = false;
    });
  }

  // Sign in with email and password
  signIn() {
    this.errorAuthentication = '';

    setPersistence(this.auth, browserSessionPersistence).then(() => {
      let email = this.email !== null ? this.email.toString() : '';
      signInWithEmailAndPassword(this.auth, email, this.password)
        .then((userCredential) => {
          this.changeUser(userCredential.user);
          this.errorAuthentication = '';
        })
        .catch((error: AuthError) => {
          // Handle errors during sign-in
          const errorCode = error.code;
          const errorMessage = error.message;

          switch (errorCode) {
            case 'auth/invalid-email':
              this.errorAuthentication = 'Ongeldig e-mailadres.';
              break;
            case 'auth/user-disabled':
              this.errorAuthentication = 'Gebruikersaccount is uitgeschakeld.';
              break;
            case 'auth/user-not-found':
              this.errorAuthentication =
                'Geen gebruiker gevonden met dit e-mailadres.';
              break;
            case 'auth/wrong-password':
              this.errorAuthentication = 'Onjuist wachtwoord.';
              break;
            case 'auth/invalid-credential':
              this.errorAuthentication = 'Ongeldige inloggegevens.';
              break;
            default:
              this.errorAuthentication = `Error: ${errorMessage} (Code: ${errorCode})`;
          }
        });
    });
  }

  async getIdToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  // Sign out the user
  signOut() {
    this.errorLoggedOut = '';

    signOut(this.auth)
      .then(() => {
        this.changeUser(null);
      })
      .catch((error) => {
        this.errorLoggedOut = 'Error bij afmelden!';
      });
  }

  changeUser(user: any) {
    this.user = user;
    this.changeDetectorRef.detectChanges();
    if (!environment.production) {
      console.log(this.user);
    }
  }
  resetPassword() {
    if (this.passwordResetEmail !== '') {
      sendPasswordResetEmail(this.auth, this.passwordResetEmail)
        .then(() => {
          alert(
            'Wachtwoord-resetlink is verzonden naar het e-mailadres van de gebruiker.'
          );
        })
        .catch((error) => {
          alert('Fout bij het verzenden van de resetlink: ' + error.message);
        });
    }
  }
}
