// src/app/auth.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private firebaseApp: FirebaseApp;
  private auth = getAuth();

  // Store email and password input fields in the component
  emailUserCreate: string = '';
  email: string = '';
  password: string = '';
  registrationPassword: string = '';
  repeatedRegistrationPassword: string = '';
  user: any = null; //holds authenticated user

  // Messages
  userCreated = '';
  errorUserCreation = '';

  userAuthenticated = '';
  errorAuthentication = '';

  userLoggedOut = '';
  errorLoggedOut = '';

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    // Initialize Firebase with your Firebase configuration
    this.firebaseApp = initializeApp(environment.firebaseConfig);
  }

  async ngOnInit() {
    console.log(this.user);
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
    this.userAuthenticated = ''
    this.errorAuthentication = '';

    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        this.changeUser(userCredential.user);
        this.userAuthenticated = 'Welkom ' + this.email;
        this.errorAuthentication = '';
      })
      .catch((error) => {
        this.errorAuthentication = 'Error bij aanmelden!';
      });
  }

  // Sign out the user
  signOut() {
    this.userLoggedOut = '';
    this.errorLoggedOut = '';
  
    signOut(this.auth)
      .then(() => {
        this.userLoggedOut = 'Gebruiker afgemeld';
        this.changeUser(null);
        this.userAuthenticated = 'Welkom ' + this.email;
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