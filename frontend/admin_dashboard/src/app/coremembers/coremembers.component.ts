import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Persistence, browserLocalPersistence, AuthError, Auth, setPersistence, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { CoreMember } from '../interfaces/core-member';


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
  coreMemberToCreate: CoreMember = { email: '' };
  email: string | null = ''; //provided by Authservice
  password: string = '';
  user: any = null; //holds authenticated user

  // Messages
  userCreated = '';
  errorUserCreation = '';

  coreMembers: CoreMember[] = [];


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private apiService: ApiService
  ) {
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
        this.changeUser(null)

      }
    });

    this.getCoreMembers();
  }

  // Create a new core member
  signUp() {
    this.userCreated = ''
    this.errorUserCreation = '';

    this.correctPhoneNumber();

    this.apiService.createCoreMember(this.coreMemberToCreate).subscribe({
      next: (result) => {
        //console.log(result);
        this.userCreated = 'Gebruiker aangemaakt';

        sendPasswordResetEmail(this.auth, this.coreMemberToCreate.email)
        .then(() => {
          alert('Wachtwoord-resetlink is verzonden naar het e-mailadres van de gebruiker.');
        })
        .catch((error) => {
          alert('Fout bij het verzenden van de resetlink: ' + error.message);
        });

        this.getCoreMembers();
      },
      error: (error) => {
        this.errorUserCreation = error.message;
      }
    })
  }

  private correctPhoneNumber() {
    // Phone number correction for Belgium to comply with Firebase's format
    if (this.coreMemberToCreate.phone_number !== undefined && this.coreMemberToCreate.phone_number[0] === '0') {
      this.coreMemberToCreate.phone_number = '+32' + this.coreMemberToCreate.phone_number?.slice(0); //remove the first 0
    }
  }

  // Get core members
  private getCoreMembers() {
    this.apiService.getAllCoreMembers().subscribe({
      next: (result) => {
        this.coreMembers = result;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  changeUser(user: any) {
    this.user = user;
    this.changeDetectorRef.detectChanges();
    console.log(this.user);
  }

  editCoreMember(coreMember: CoreMember) {
  }

  deleteCoreMember(coreMember: CoreMember) {
    if (coreMember.id !== undefined) {
      this.apiService.deleteCoreMember(coreMember.id).subscribe({
      next: (result) => {
        this.getCoreMembers();
      },
      error: (error) => {
        console.log(error);
      }
      });
    } else {
      console.log('Core member ID is undefined');
    }
   }

}
