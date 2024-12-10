

import { Component, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, AngularFireModule.initializeApp(environment.firebaseConfig), AngularFireAuthModule],
  templateUrl: './login.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  private afAuth = inject(AngularFireAuth);
  user$: Observable<any> = this.afAuth.authState;

  constructor() {}

  signup(email: string, password: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password)
      .then(response => {
        console.log('User signed up:', response);
      })
      .catch(error => {
        console.error('Error signing up:', error);
      });
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .then(response => {
        console.log('User logged in:', response);
      })
      .catch(error => {
        console.error('Error logging in:', error);
      });
  }

  logout() {
    this.afAuth.signOut()
      .then(() => {
        console.log('User logged out');
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  }
}