import { Component, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { Edition } from '../interfaces/edition';
import { HelpersService } from '../services/helpers.service';
import { LoadingComponent } from "../components/loading/loading.component";
import { Club, ClubCreate } from '../interfaces/club';
import { ParticipatingClub, ParticipatingClubPatcher } from '../interfaces/participating-club';
import { environment } from '../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, IconButtonComponent, LoadingComponent],
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.scss'
})
export class ClubsComponent {
  loadingClubs: boolean = false;
  loadingParticipatingClubs: boolean = false;
  loadingVolunteers: boolean = false;

  //Data Collection URL
  dataCollectionUrl: string = "";

  //Clubs
  allClubs: Club[] = [];
  clubDictionary: { [key: number]: Club } = {}; //Dictionary of all clubs

  participatingClubs: ParticipatingClub[] = [];
  participatingClubIds: number[] = [];

  editionYear: number | null = null;

  newClub: Club = {
    id: 0,
    name: '',
    email: '',
    contact: '',
    phone: '',
    link: '',
    bank_account: '',
    address: '',
    btw_number: '',
    postal_code: '',
    city: ''
  };

  selectedClub: Club = this.newClub;
  selectedClubId: number = 0;

  // Link
  link: string = '';

  // CRUD
  clubToManageLinkFor: Club | undefined = undefined;
  participatingClubToDelete: ParticipatingClub | null = null;
  clubToDelete: Club | null = null;
  participatingClubToEdit: ParticipatingClubPatcher | null = null;
  participatingClubToEditId: number = -1;

  // Messages
  clubCreated: string = '';
  errorClubCreation: string = '';

  clubEdited: string = '';
  errorClubEdit: string = '';

  clubDeleted: string = '';
  errorClubDeletion: string = '';

  participatingClubDeleted: string = '';
  errorParticipatingClubDeletion: string = '';

  linkSent: string = '';
  errorLinkSending: string = '';

  linkGenerated: string = '';
  errorLinkGeneration: string = '';

  // Modal
  @ViewChild('linkModal') linkModal!: ModalComponent;
  @ViewChild('editModal') editModal!: ModalComponent;
  @ViewChild('deleteParticipatingModal') deleteParticipatingModal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(private apiService: ApiService, private helperService: HelpersService) {}

  ngOnInit(): void {
    if (environment.production) { // Production
      this.dataCollectionUrl = "https://data.gladioforce.org/";
    } else { // Development
      this.dataCollectionUrl = "http://localhost:4201/";
    }

    this.loadCurrentEdition();
    this.loadParticipatingClubs();
    this.loadClubs();
  }

  onModelChange(): void {
    if (this.selectedClubId !== 0 && this.selectedClub !== undefined) { // Existing club
      let foundClub: Club = this.clubDictionary[this.selectedClubId];
  
      if (foundClub !== undefined) {
        this.selectedClub = foundClub; // Assign the found club
        this.selectedClub.id = this.selectedClubId; // Now update the club_id after assignment
      }
    } else { // New club
      this.resetNewClub();
    }
  }

  loadCurrentEdition() {
    this.apiService.getCurrentEdition().subscribe((data: Edition) => {
      this.editionYear = data.year;
    });
  }

  loadParticipatingClubs(): void {
    this.loadingParticipatingClubs = true;

    this.apiService.getParticipatingClubs().subscribe((data: ParticipatingClub[]) => {
      this.participatingClubs = data;

      // Make list of the IDs of the participating clubs
      this.participatingClubIds = [];
      for (let club of this.participatingClubs) {
        if (!this.participatingClubIds.includes(club.club_id)) {
          this.participatingClubIds.push(club.club_id);
        }
      }

      this.loadingParticipatingClubs = false;
    });
  }

  loadClubs(): void {
    this.loadingClubs = true;

    this.apiService.getAllClubs().subscribe((data: Club[]) => {
      this.allClubs = data;

      for (let club of this.allClubs) {
        this.clubDictionary[club.id] = club;
      }

      this.loadingClubs = false;
    });
  }

  isClubParticipating(): boolean {
    return this.participatingClubIds.includes(Number(this.selectedClubId));
  }

  addClub(): void {
    let clubToCreate: ClubCreate = {
      club_id: Number(this.selectedClubId),
      name: this.selectedClub.name,
      email: this.selectedClub.email,
      contact: this.selectedClub.contact,
      phone: this.selectedClub.phone,
      link: '',
      bank_account: this.selectedClub.bank_account,
      address: this.selectedClub.address,
      btw_number: this.selectedClub.btw_number,
      postal_code: this.selectedClub.postal_code,
      city: this.selectedClub.city,
      person_in_charge_day1: null,
      person1_in_charge_day1: null,
      person_in_charge_day2: null,
      person1_in_charge_day2: null
    }

    this.apiService.addClub(clubToCreate).subscribe({
      next: (result) => {
        this.loadClubs();
        this.loadParticipatingClubs();
        this.resetNewClub();
        this.clubCreated = 'Club succesvol toegevoegd!';
        this.errorClubCreation = '';
      }, error: (error) => {
        this.errorClubCreation = this.helperService.parseError(error);
        this.clubCreated = '';
      }
    });
  }
  
  resetNewClub(): void {
    this.newClub = {
      id: 0,
      name: '',
      email: '',
      contact: '',
      phone: '',
      link: '',
      bank_account: '',
      address: '',
      btw_number: '',
      postal_code: '',
      city: ''
    };

    this.selectedClub = this.newClub;
    this.selectedClubId = 0; 
  }

  private resetLinkMessages(): void {
    this.linkSent = '';
    this.errorLinkSending = '';
    this.linkGenerated = '';
    this.errorLinkGeneration = '';
  }

  // Link Popup
  openLinkModal(club: Club): void {
    this.clubToManageLinkFor = club;
    this.resetLinkMessages();

    // Build the Link in front end so the core members are able to verify and test it
    if (
      this.clubToManageLinkFor.link !== undefined &&
      this.clubToManageLinkFor.link !== null &&
      this.clubToManageLinkFor.link !== ''
    ) {  
      this.link = this.dataCollectionUrl + club.link + '/';
    } else {
      this.link = '';
    }

    // Open the modal
    setTimeout(() => {
      if (this.linkModal) {
        this.linkModal.openModal();
      }
    });
  }

  // Link
  generateLink(): void {
    this.resetLinkMessages();

    if (this.clubToManageLinkFor !== undefined) {
      this.apiService.generateLink(this.clubToManageLinkFor.id).subscribe({
        next: (data) => {
          this.loadClubs();
          this.link = this.dataCollectionUrl + data.link + '/';
          if (this.clubToManageLinkFor) {
            this.clubToManageLinkFor.link = data.link;

            this.linkGenerated = 'Link gegenereerd!';
          }
        },
        error: (error) => {
          this.errorLinkGeneration = this.helperService.parseError(error);
        }
      });
    }
  }

  sendLink(): void {
    this.resetLinkMessages();
    //TODO: WRITE API CALL TO SEND LINK
  }

  // Edit Popup
  openEditModal(club: ParticipatingClub): void {
    this.clubEdited = '';
    this.errorClubEdit = '';

    this.participatingClubToEditId = Number(club.id);

    let clubToEdit: Club = this.clubDictionary[club.club_id];
    this.participatingClubToEdit = {
      club_id: Number(club.club_id),
      name: clubToEdit.name,
      email: clubToEdit.email,
      contact: clubToEdit.contact,
      phone: clubToEdit.phone,
      bank_account: clubToEdit.bank_account,
      address: clubToEdit.address,
      btw_number: clubToEdit.btw_number,
      postal_code: clubToEdit.postal_code,
      city: clubToEdit.city,
      person_in_charge_day1: club.person_in_charge_day1,
      person1_in_charge_day1: club.person1_in_charge_day1,
      person_in_charge_day2: club.person_in_charge_day2,
      person1_in_charge_day2: club.person1_in_charge_day2
    }

    setTimeout(() => {
      if (this.editModal) {
        this.editModal.openModal();
      }
    });
  }

  // Edit
  updateClub(): void {
    if (this.participatingClubToEdit !== null) {
      console.log(this.participatingClubToEdit);

      this.apiService.updateParticipatingClub(this.participatingClubToEdit, this.participatingClubToEditId).subscribe({
        next: (result) => {
          this.loadParticipatingClubs();
          this.loadClubs();
          this.clubEdited = 'Vereniging succesvol aangepast!';
          this.errorClubEdit = '';
        },
        error: (error) => {
          this.errorClubEdit = this.helperService.parseError(error);
          this.clubEdited = '';
        }
      });
    }
  }

  // Delete Participating Popup
  openDeleteParticipatingModal(club: ParticipatingClub) {
    this.participatingClubDeleted = '';
    this.errorParticipatingClubDeletion = '';
  
    this.participatingClubToDelete = {...club}; // {...} ensures a copy is made and not a reference

    setTimeout(() => { // Wait for the view to update
      if (this.deleteParticipatingModal) { // Wait until the view is initialized (you may have to click twice the first time)
        this.deleteParticipatingModal.openModal();  
      }
    });
  }

  // Delete Participating
  deleteParticipatingClub(): void {
    this.participatingClubDeleted = '';
    this.errorParticipatingClubDeletion = '';

    if (this.participatingClubToDelete !== null) {
      this.apiService.deleteParticipatingClub(Number(this.participatingClubToDelete.id)).subscribe({
        next: (result) => {
          this.loadParticipatingClubs();
          this.participatingClubDeleted = 'Vereniging verwijderd voor Editie ' + this.editionYear + '.';
        },
        error: (error) => {
          this.errorParticipatingClubDeletion = this.helperService.parseError(error);
        }
      });
    }
  }

  // Delete Popup
  openDeleteModal(club: Club) {
    this.clubDeleted = '';
    this.errorClubDeletion = '';
  
    this.clubToDelete = {...club}; // {...} ensures a copy is made and not a reference

    setTimeout(() => { // Wait for the view to update
      if (this.deleteModal) { // Wait until the view is initialized (you may have to click twice the first time)
        this.deleteModal.openModal();  
      }
    });
  }

  // Delete
  deleteClub(): void {
    this.clubDeleted = '';
    this.errorClubDeletion = '';

    if (this.clubToDelete !== null) {
      this.apiService.deleteClub(Number(Number(this.selectedClubId))).subscribe({
        next: (result) => {
          this.loadClubs();
          this.loadParticipatingClubs();
          this.resetNewClub();
          this.clubDeleted = 'Vereniging succesvol verwijderd!';
        },
        error: (error) => {
          this.errorClubDeletion = this.helperService.parseError(error);
        }
      });
    }
  }
}
