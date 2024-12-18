import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Persistence, browserLocalPersistence, AuthError, Auth, setPersistence, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-coremembers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coremembers.component.html',
  styleUrl: './coremembers.component.scss'
})
export class CoremembersComponent implements OnInit {
  private firebaseApp: FirebaseApp;
  private auth: Auth = getAuth();

  // Store email and password input fields in the component
  emailUserCreate: string = '';
  email: string | null = ''; //provided by Authservice
  password: string = '';
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
    
    // setPersistence(this.auth, browserLocalPersistence) // this ensures the newly created user isn't logged in automatically (= Firebases's default behaviour)
    //   .then(() => {
        // Creates a user with temporary password
        createUserWithEmailAndPassword(this.auth, this.emailUserCreate, this.generateTemporaryPassword())
          .then((userCredential) => {
            this.changeUser(userCredential.user);

            this.userCreated = 'Gebruiker aangemaakt';
            this.errorUserCreation = '';
    
            sendPasswordResetEmail(this.auth, this.emailUserCreate)
            .then(() => {
              alert('Wachtwoord-resetlink is verzonden naar het e-mailadres van de gebruiker.');
            })
            .catch((error) => {
              alert('Fout bij het verzenden van de resetlink: ' + error.message);
            });
          })
          .catch((error) => {
            this.errorUserCreation = 'Error bij registreren!';
          }
        );
    //   }
    // );
  }


  private generateTemporaryPassword() {
    let possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]\=-)(*&^%$#@!~`";
    const lengthOfCode: number = 40;

    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
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
    console.log(this.user);
  }
}
