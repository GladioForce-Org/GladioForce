import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, Auth, sendPasswordResetEmail } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { CoreMember } from '../interfaces/core-member';
import { HttpErrorResponse } from '@angular/common/http';
import { IconButtonComponent } from "../components/icon-button/icon-button.component";
import { HelpersService } from '../services/helpers.service';
import { ModalComponent } from "../components/modal/modal.component";


@Component({
  selector: 'app-coremembers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconButtonComponent, ModalComponent],
  templateUrl: './coremembers.component.html',
  styleUrl: './coremembers.component.scss'
})
export class CoremembersComponent implements OnInit {
  private firebaseApp: FirebaseApp;
  private auth: Auth = getAuth();

  // Store email and password input fields in the component
  coreMemberToCreate: CoreMember = { email: '' };
  email: string | null | undefined = ''; //provided by Authservice
  password: string = '';
  user: any = null; //holds authenticated user

  // Messages
  userCreated = '';
  errorUserCreation = '';

  userEdited = '';
  errorUserEdited = '';

  coreMembers: CoreMember[] = [];
  selectedCoreMember: CoreMember | null = null;

  //Modal
  @ViewChild('modalComponent') modalComponent!: ModalComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private apiService: ApiService,
    private helperService: HelpersService
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
    this.userCreated = '';
    this.errorUserCreation = '';

    this.coreMemberToCreate.phone_number = this.correctPhoneNumber(this.coreMemberToCreate);

    this.apiService.createCoreMember(this.coreMemberToCreate).subscribe({
      next: (result) => {
        //console.log(result);
        this.userCreated = 'Gebruiker aangemaakt.';

        sendPasswordResetEmail(this.auth, this.coreMemberToCreate.email)
        .then(() => {
          alert('Wachtwoord-resetlink is verzonden naar het e-mailadres van de gebruiker.');
        })
        .catch((error) => {
          alert('Fout bij het verzenden van de resetlink: ' + error.message);
        });

        this.getCoreMembers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorUserCreation = this.helperService.parseError(error);
      }
    });
  }

  private correctPhoneNumber(coreMember: CoreMember): string | null | undefined {
    // Phone number correction for Belgium to comply with Firebase's format
    if (coreMember.phone_number !== undefined && coreMember.phone_number !== null) {
      coreMember.phone_number = coreMember.phone_number.replace(/\//g, "").replace(/\s/g, ""); //removes all forward slashes and spaces

      if (coreMember.phone_number[0] === '0') {
        coreMember.phone_number = '+32' + coreMember.phone_number?.slice(1); //remove the first 0
      }
    }

    return coreMember.phone_number;
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

  // Delete
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

  // Edit (Modal for popup and Edit Function)
  openModal(coreMember: CoreMember) {
    this.userEdited = '';
    this.errorUserEdited = '';  

    this.selectedCoreMember = coreMember;

    if (this.modalComponent) { // Wait until the view is initialized (you may have to click twice the first time but who cares)
      this.modalComponent.openModal();  
    }
  }

  editCoreMember() {
    this.userEdited = '';
    this.errorUserEdited = '';  

    if (this.selectedCoreMember !== null && this.selectedCoreMember.id !== undefined) {
      this.selectedCoreMember.phone_number = this.correctPhoneNumber(this.selectedCoreMember);

      // BUG FIX: needed to be able to empty the fields again
      // if (this.selectedCoreMember.phone_number === undefined || this.selectedCoreMember.phone_number === '') {
      //   // Otherwise you can't remove the phone number!
      //   this.selectedCoreMember.phone_number = null;
      // }

      //ALSO FOR DISPLAYNAME

      this.apiService.updateCoreMember(this.selectedCoreMember.id, this.selectedCoreMember).subscribe({
        next: (result) => {
          //console.log(result);
          this.userEdited = 'Gebruiker aangepast.';
  
          this.getCoreMembers();
        },
        error: (error: HttpErrorResponse) => {
          this.errorUserEdited = this.helperService.parseError(error);
        }
      });
    }
  }
}
