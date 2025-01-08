import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AvailableTshirt, AvailableTshirtPatcher } from '../interfaces/available-tshirt';
import { Size } from '../interfaces/size';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';
import { Tshirt } from '../interfaces/tshirt';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { Edition } from '../interfaces/edition';
import { HelpersService } from '../services/helpers.service';
import { LoadingComponent } from "../components/loading/loading.component";
import { CustomDropdownComponent } from "../components/custom-dropdown/custom-dropdown.component";
import { Club, ClubCreate } from '../interfaces/club';
import { ParticipatingClub } from '../interfaces/participating-club';
import { Volunteer } from '../interfaces/volunteer';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconButtonComponent, LoadingComponent, CustomDropdownComponent],
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.scss'
})
export class ClubsComponent {
  loadingClubs: boolean = false;
  loadingParticipatingClubs: boolean = false;
  loadingVolunteers: boolean = false;

  //Data Collection URL
  dataCollectionUrl = "";

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

  volunteers: Volunteer[] = []; // The volunteers of the selected club

  clubToManageLinkFor: Club | undefined = undefined;

  participatingClubToDelete: ParticipatingClub | null = null;
  clubToDelete: Club | null = null;

  tshirtToEdit: AvailableTshirtPatcher | null = null;
  tshirtToEditSizes: number[] = [];

  sizeToCreate: string = '';

  link: string = '';

  // Messages
  clubCreated: string = '';
  errorClubCreation: string = '';

  tshirtEdited: string = '';
  errorTshirtEdit: string = '';

  clubDeleted = '';
  errorClubDeletion = '';

  participatingClubDeleted = '';
  errorParticipatingClubDeletion = '';

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
    if (this.selectedClubId !== 0 && this.selectedClub !== undefined) { // Existing t-shirt
      let foundClub: Club = this.clubDictionary[this.selectedClubId];
  
      if (foundClub !== undefined) {
        this.selectedClub = foundClub; // Assign the found club
        this.selectedClub.id = this.selectedClubId; // Now update the club_id after assignment
        this.loadVolunteers();
      }
    } else { // New t-shirt
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
    // yes it is necessary to do this number conversion because the selectedClubId is apparently an object :S
    return this.participatingClubIds.includes(Number(this.selectedClubId));
  }

  // toggleSize(size: Size) {
  //   //selectedTshirt
  //   const index = this.selectedTshirtSizes.indexOf(size.id);
  //   if (index === -1) {
  //     this.selectedTshirt.sizes.push(size);
  //   } else {
  //     this.selectedTshirt.sizes.splice(index, 1);
  //   }

  //   this.selectedTshirtSizes = this.selectedTshirt.sizes.map((size: Size) => size.id);

  //   console.log(this.selectedTshirtSizes);

  //   if (this.selectedTshirt.tshirt_id != 0) {
  //     let patchModel: Tshirt = {
  //       sizes: this.selectedTshirtSizes
  //     };
      
  //     console.log('T-shirt patchen:', this.selectedTshirt.model);

  //     console.log('tshirt ID:', this.selectedTshirt.tshirt_id);

  //     this.apiService.updateTshirt(patchModel, this.selectedTshirt.tshirt_id).subscribe({
  //       next: (result) => {
  //         this.loadTshirts();
  //         this.loadModels();    
  //       },
  //       error: (error) => {
  //         console.error('Error bij het updaten van de t-shirt:', error);
  //       }
  //     });
  //   }
  // }

  toggleVolunteers(size: Size) {
    if(this.tshirtToEdit !== null) {
      const index = this.tshirtToEditSizes.indexOf(size.id);

      if (index === -1) {
        this.tshirtToEdit.sizes.push(size);
      } else {
        this.tshirtToEdit.sizes.splice(index, 1);
      }

      this.tshirtToEditSizes = this.tshirtToEdit.sizes.map((size: Size) => size.id);
    }
  }

  loadVolunteers(): void {
    this.loadingVolunteers = true;

    // Fetch sizes for the selected model
    this.apiService.getVolunteersByClubId(this.selectedClub.id).subscribe(
      (volunteers) => { // Update sizes for the selected model
        this.volunteers = volunteers;
        this.loadingVolunteers = false;
      },
      (error) => {
        console.error('Error bij het ophalen van de leden van de club:', error);
      }
    );
  }

  // createOrUpdateSize(): void {
  //   if (!this.sizeToCreate.trim()) {
  //     console.warn('Maat mag niet leeg zijn.');
  //     return;
  //   }

  //   const requestBody = { size: this.sizeToCreate.trim() };

  //   if (this.selectedClubId == 0) {
  //     console.log('Aanmaken van nieuwe maat:', this.sizeToCreate);
  //     // Create a new size
  //     this.apiService.createSize(requestBody).subscribe(
  //       () => {
  //         console.log('Maat aangemaakt:', this.sizeToCreate);
  //         this.loadSizes();
  //         this.sizeToCreate = '';
  //       },
  //       (error) => {
  //         console.error('Error bij het aanmaken van een maat:', error);
  //         if (error.status === 400) {
  //           console.error("Bad Request: Misschien bestaat de maat al of is ze niet geldig.");
  //         }
  //         else {
  //           console.error(this.helperService.parseError(error));
  //         }
  //       }
  //     );
  //   } else {
  //     // Patch the t-shirt with the updated sizes
  //     const updatedTshirt = { ...this.selectedTshirt, sizes: [...this.newTshirt.sizes, this.sizeToCreate.trim()] };
  //     this.apiService.updateTshirt(updatedTshirt, this.selectedClubId).subscribe(
  //       () => {
  //         console.log('T-shirt updated with new size:', this.sizeToCreate);
  //         this.loadTshirts();
  //         this.sizeToCreate = '';
  //       },
  //       (error) => {
  //         console.error(this.helperService.parseError(error));
  //       }
  //     );
  //   }
  // }

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

    this.apiService.addClub(clubToCreate).subscribe(() => {
      this.loadClubs();
      this.loadParticipatingClubs();
      this.resetNewClub();
      this.clubCreated = 'Club succesvol toegevoegd!';
      this.errorClubCreation = '';

      let $event  = new Event('click');
    }, error => {
      this.errorClubCreation = this.helperService.parseError(error);
      this.clubCreated = '';
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
    // this.tshirtToEdit = {
    //   id: tshirt.id,
    //   tshirt_id: tshirt.tshirt_id,
    //   model: tshirt.model,
    //   sizes: [...tshirt.sizes],
    //   price: tshirt.price
    // }

    // this.tshirtToEditSizes = this.tshirtToEdit.sizes.map((size: Size) => size.id);

    setTimeout(() => {
      if (this.editModal) {
        this.editModal.openModal();
      }
    });
  }

  // Edit
  updateTshirt(tshirt: AvailableTshirtPatcher): void {
    // remove ID from editObject to comply with the API
    let editObject = {
      tshirt_id: tshirt.tshirt_id,
      model: tshirt.model,
      sizes: tshirt.sizes,
      price: tshirt.price
    }

    this.apiService.updateAvailableTshirt(editObject, tshirt.id).subscribe(() => {
      this.loadParticipatingClubs();
      this.loadClubs();
      this.tshirtEdited = 'T-shirt succesvol aangepast!';
      this.errorTshirtEdit = '';
    }, error => {
      this.errorTshirtEdit = this.helperService.parseError(error);
      this.tshirtEdited = '';
    });
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

  // Delete Participating Popup
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

  // Delete Participating
  deleteClub(): void {
    this.clubDeleted = '';
    this.errorClubDeletion = '';

    if (this.clubToDelete !== null) {
      this.apiService.deleteClub(Number(Number(this.selectedClubId))).subscribe({
        next: (result) => {
          this.loadClubs();
          this.loadParticipatingClubs();
          this.resetNewClub();
          this.participatingClubDeleted = 'Vereniging verwijderd voor Editie ' + this.editionYear + '.';
        },
        error: (error) => {
          this.errorParticipatingClubDeletion = this.helperService.parseError(error);
        }
      });
    }
  }
}
