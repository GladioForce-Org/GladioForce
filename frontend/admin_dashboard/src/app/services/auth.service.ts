import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = getAuth();

  // BehaviorSubject to store the email and allow other parts of the app to subscribe to changes
  private emailSubject = new BehaviorSubject<string | null>(null);

  // Observable for the email
  email$ = this.emailSubject.asObservable();

  constructor() {
    // Listen for authentication state changes and update the email value
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.emailSubject.next(user.email); // Update the BehaviorSubject with the user's email
      } else {
        this.emailSubject.next(null); // Set to null if no user is signed in
      }
    });
  }

  getCurrentEmail(): string | null {
    return this.emailSubject.getValue();
  }
}
