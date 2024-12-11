// src/app/auth.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Persistence, browserLocalPersistence, AuthError, Auth, setPersistence } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private firebaseApp: FirebaseApp;
  private auth: Auth = getAuth();

  // Store email and password input fields in the component
  emailUserCreate: string = '';
  email: string | null = ''; //provided by Authservice
  password: string = '';
  registrationPassword: string = '';
  repeatedRegistrationPassword: string = '';
  user: any = null; //holds authenticated user

  // Messages
  userCreated = '';
  errorUserCreation = '';

  errorAuthentication = '';

  errorLoggedOut = '';

  constructor(private changeDetectorRef: ChangeDetectorRef, private authService: AuthService) {
    // Initialize Firebase with your Firebase configuration
    this.firebaseApp = initializeApp(environment.firebaseConfig);
  }


  async ngOnInit() {
    this.authService.email$.subscribe((email) => {
      this.email = email;
      this.changeDetectorRef.detectChanges();

    });

    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, so update the state with the user information
        this.email = user.email;
        this.changeUser(user);
      } else {
        // No user is signed in, you can handle this as needed (e.g., showing login form)
        this.changeUser(null);
      }
    });
  }

  // Create a new user (sign up)
  signUp() {
    this.userCreated = ''

    if (this.registrationPassword !== this.repeatedRegistrationPassword) {
      return;
    }

    createUserWithEmailAndPassword(this.auth, this.emailUserCreate, this.registrationPassword)
      .then((userCredential) => {
        this.changeUser(userCredential.user);
        this.userCreated = 'Gebruiker aangemaakt';
        this.errorUserCreation = '';
      })
      .catch((error) => {
        this.errorUserCreation = 'Error bij registreren!';
      });
  }

  // Method to check if the passwords match
  checkPasswordsMatch() {
    if (this.registrationPassword !== this.repeatedRegistrationPassword) {
      this.errorUserCreation = 'Wachtwoorden zijn niet gelijk!';
    } else {
      this.errorUserCreation = '';
    }
  }

  // Sign in with email and password
  signIn() {
    this.errorAuthentication = '';
    
    setPersistence(this.auth, browserLocalPersistence).then(() => {
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
          case "auth/invalid-email":
            this.errorAuthentication = "Ongeldig e-mailadres.";
            break;
          case "auth/user-disabled":
            this.errorAuthentication = "Gebruikersaccount is uitgeschakeld.";
            break;
          case "auth/user-not-found":
            this.errorAuthentication = "Geen gebruiker gevonden met dit e-mailadres.";
            break;
          case "auth/wrong-password":
            this.errorAuthentication = "Onjuist wachtwoord.";
            break;
          default:
            this.errorAuthentication = `Error: ${errorMessage} (Code: ${errorCode})`;
        }
      });
    })

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
    console.log(this.user);
  }
}