import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Club } from '../interfaces/club';
import { ApiService } from '../services/api.service';
import { HelpersService } from '../services/helpers.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';
import { LoadingComponent } from '../components/loading/loading.component';
import { IconButtonLinkComponent } from '../sidebar/icon-button-link/icon-button-link.component';
import { Volunteer } from '../interfaces/volunteer';
import { HttpErrorResponse } from '@angular/common/http';
import { AvailableTshirt } from '../interfaces/available-tshirt';
import { Edition } from '../interfaces/edition';
import { Size } from '../interfaces/size';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { FeatherIconComponent } from "../components/feather-icon/feather-icon.component";
import { TimeRegistration } from '../interfaces/time-registration';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [RouterModule, CommonModule, FeatherIconComponent, IconButtonComponent, IconButtonLinkComponent, FormsModule, ModalComponent, LoadingComponent, FeatherIconComponent],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss'
})
export class VolunteersComponent implements OnInit, AfterViewInit {
  currentYear: number | null = null;

  // Loading
  public loading: boolean = false;
  public loadingTshirts: boolean = false;
  public loadingSizes: boolean = false;
  public loadingTimeRegistrations: boolean = false;

  // Club
  club_id: number = -1;
  club: Club | undefined = undefined;

  // Volunteers
  volunteers: Volunteer[] = [];
  volunteerToCreate: Volunteer = {
    first_name: '',
    last_name: '',
    works_day1: false,
    works_day2: false,
    national_registry_number: '',
    needs_parking_day1: false,
    needs_parking_day2: false
  };

  // T-shirts
  availableTshirts: AvailableTshirt[] = [];
  availableTshirtDictionary: { [key: number]: AvailableTshirt } = {}; //Dictionary of all available t-shirts
  availableSizes: Size[] = [];
  sizeDictionary: { [key: number]: Size } = {}; //Dictionary of all sizes

  // Time Registrations
  timeRegistrations: TimeRegistration[] = [];
  totalTimeWorked: string = 'geen tijd geregistreerd voor deze vrijwilliger.';

  // Messages
  volunteerCreated = '';
  errorVolunteerCreation = '';

  volunteerEdited = '';
  errorVolunteerEdit = '';

  volunteerDeleted = '';
  errorVolunteerDeletion = '';

  timeRegistrationSuccess = '';
  errorTimeRegistrations = '';

  selectedVolunteer: Volunteer | null = null;
  
  // Modal
  @ViewChild('timeRegistrationModal') timeRegistrationModal!: ModalComponent;
  @ViewChild('editModal') editModal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private helperService: HelpersService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.club_id = Number(params['id']);
      this.apiService.getClub(this.club_id).subscribe({
        next: (result) => {
          this.club = result;
        },
        error: (error) => {
          console.log(this.helperService.parseError(error));
        }
      });

      this.getCurrentEdition();
      this.getTshirts();
      this.getSizes();
      this.getVolunteers();
    });
  }

  ngAfterViewInit(): void {
    // Ensure the modals are properly initialized
    if (this.editModal) {
      this.editModal.closeModal();
    }
    if (this.deleteModal) {
      this.deleteModal.closeModal();
    }
  }

  // Get Current Edition
  getCurrentEdition() {
    this.apiService.getCurrentEdition().subscribe((data: Edition) => {
      this.currentYear = data.year;
    });
  }

  // Get T-shirts
  getTshirts(): void {
    this.loadingTshirts = true;

    this.apiService.getAvailableTshirts().subscribe({
      next: (result) => {
        this.availableTshirts = result;

        this.availableTshirtDictionary = {}; // Reset dictionary
        this.availableTshirts.forEach((tshirt) => {
          this.availableTshirtDictionary[tshirt.id] = tshirt;
        });
        this.loadingTshirts = false;
      },
      error: (error) => {
        this.loadingTshirts = false;
        console.error('Error bij het ophalen van de T-shirts:', error);
      }
    });
  }

  // Get All Sizes
  getSizes(): void {
    this.apiService.getSizes().subscribe({
      next: (result) => {
        this.sizeDictionary = {}; // Reset dictionary
        result.forEach((size) => {
          this.sizeDictionary[size.id] = size;
        });
      },
      error: (error) => {
        console.error('Error bij het ophalen van de maten:', error);
      }
    });
  }

  // Get volunteers
  private getVolunteers() {
    this.loading = true;

    this.apiService.getVolunteersByClubId(this.club_id).subscribe({
      next: (result) => {
        this.volunteers = result;
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  }

  // Create
  createVolunteer() {
    this.volunteerCreated = '';
    this.errorVolunteerCreation = '';

    this.apiService.addVolunteer(this.club_id, this.volunteerToCreate).subscribe({
      next: (result) => {
        this.volunteerCreated = 'Vrijwilliger aangemaakt.';
        this.getVolunteers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorVolunteerCreation = this.helperService.parseError(error);
      }
    });
  }

  // Get Available Sizes based on value of t-shirt model selected in the forms
  determineListOfSizesForCRUDs(volunteer: Volunteer): void {
    if (volunteer.tshirt_id !== undefined && volunteer.size_id !== null) {
      this.loadingSizes = true;

      this.apiService.getSizesByTshirtId(Number(volunteer.tshirt_id)).subscribe({
        next: (result) => {
          this.availableSizes = result;

          // reset size_id if size isn't available (should work because of the object reference)
          let sizesList: Number[] = this.availableSizes.map((size) => Number(size.id));
          if (!sizesList.includes(Number(volunteer.size_id))) {
            volunteer.size_id = undefined;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(this.helperService.parseError(error));
        }
      });
    }
  }

  // Reset Parking if not working
  setParkingToFalseIfNeeded(volunteer: Volunteer): void {
    if (!volunteer.works_day1) {
      volunteer.needs_parking_day1 = false;
    }

    if (!volunteer.works_day2) {
      volunteer.needs_parking_day2 = false;
    }
  }

  // Time Registration Popup
  openTimeRegistrationModal(volunteer: Volunteer) {
    this.timeRegistrationSuccess = '';
    this.errorTimeRegistrations = '';

    this.selectedVolunteer = { ...volunteer }; // Make a copy of the volunteer

    this.getTimeRegistrations();

    setTimeout(() => {
      if (this.timeRegistrationModal) {
        this.timeRegistrationModal.openModal();
      }
    });
  }

  // Get Time Registration for a Volunteer for the Current Edition
  private getTimeRegistrations() {
    this.timeRegistrations = [];

    if (this.selectedVolunteer !== null && this.selectedVolunteer.id !== undefined) {
      this.loadingTimeRegistrations = true;

      this.apiService.getTimeRegistrationsForVolunteerAndCurrentEdition(Number(this.selectedVolunteer.id)).subscribe({
        next: (result) => {
          this.timeRegistrations = result;
          
          this.compensateForBadData();

          this.calculateTotalTimeWorked();

          this.loadingTimeRegistrations = false;
        },
        error: (error) => {
          this.errorTimeRegistrations = this.helperService.parseError(error);
          this.loadingTimeRegistrations = false;
        }
      });
    }
  }

  // Compensate for Bad Data (1 time stamp is actually enough, so this is fine)
  compensateForBadData(): void {
    let isStartTime: boolean = true;
    if (this.timeRegistrations.length > 0) {
      for (let timeRegistration of this.timeRegistrations) {
        if (isStartTime && timeRegistration.start_time === null) {
          timeRegistration.start_time = timeRegistration.end_time;
          timeRegistration.end_time = null;
        }

        if (!isStartTime && timeRegistration.end_time === null) {
          timeRegistration.end_time = timeRegistration.start_time;
          timeRegistration.start_time = null;
        }

        isStartTime = !isStartTime;
      }
    }
  }

  // Calculate Total Time Worked
  calculateTotalTimeWorked() {
    this.totalTimeWorked = 'geen tijd geregistreerd voor deze vrijwilliger.';

    let isStartTime: boolean = true;
    let startTimeInSeconds: number = -1;
    let endTimeInSeconds: number = -1;
    let totalTimeWorkedInSeconds: number = 0;

    if (this.timeRegistrations.length > 0 && this.timeRegistrations.length % 2 === 0) {
      for(let timeRegistration of this.timeRegistrations) {
        let timeStamp: string | null = timeRegistration.start_time !== null ? timeRegistration.start_time : timeRegistration.end_time;

        if (timeStamp !== null) { // Should never happen, indicates incorrect data
          let hoursMinutesSeconds: string[] = timeStamp.split(':');

          if (isStartTime) {
            isStartTime = false; // set up for next item
            startTimeInSeconds = Number(hoursMinutesSeconds[0]) * 3600 + Number(hoursMinutesSeconds[1]) * 60 + Number(hoursMinutesSeconds[2]);
          } else {
            isStartTime = true; // set up for next item
            endTimeInSeconds = Number(hoursMinutesSeconds[0]) * 3600 + Number(hoursMinutesSeconds[1]) * 60 + Number(hoursMinutesSeconds[2]);

            if (endTimeInSeconds > -1 && startTimeInSeconds > -1) {
              totalTimeWorkedInSeconds += endTimeInSeconds - startTimeInSeconds;
            }
          }
        }
      }

      if (totalTimeWorkedInSeconds > 0) {
        let hours: number = Math.floor(totalTimeWorkedInSeconds / 3600);
        let minutes: number = Math.floor((totalTimeWorkedInSeconds % 3600) / 60);
        let seconds: number = totalTimeWorkedInSeconds % 60;

        this.totalTimeWorked = `${hours} uur, ${minutes} minuten en ${seconds} seconden.`;
      }
    }
  }

  // Delete Time Registration
  deleteTimeRegistration(timeRegistration: TimeRegistration) {
    this.timeRegistrationSuccess = '';
    this.errorTimeRegistrations = '';

    if (timeRegistration !== null && timeRegistration.id !== undefined) {
      this.apiService.deleteTimeRegistration(Number(timeRegistration.id)).subscribe({
        next: (result) => {
          this.timeRegistrationSuccess = 'Tijdsregistratie verwijderd.';
          this.getTimeRegistrations();
        },
        error: (error: HttpErrorResponse) => {
          this.errorTimeRegistrations = this.helperService.parseError(error);
        }
      });
    }
  }

  // Create Time Registration
  createTimeRegistration() {

  }

  // Edit Popup
  openEditModal(volunteer: Volunteer) {
    this.volunteerEdited = '';
    this.errorVolunteerEdit = '';

    this.selectedVolunteer = { ...volunteer }; // Make a copy of the volunteer
    this.determineListOfSizesForCRUDs(this.selectedVolunteer);

    setTimeout(() => {
      if (this.editModal) {
        this.editModal.openModal();
      }
    });
  }

  // Edit
  editVolunteer() {
    this.volunteerEdited = '';
    this.errorVolunteerEdit = '';
    
    if (this.selectedVolunteer !== null && this.selectedVolunteer.id !== undefined) {
      let volunteerToEdit: Volunteer = {
        first_name: this.selectedVolunteer.first_name,
        last_name: this.selectedVolunteer.last_name,
        works_day1: this.selectedVolunteer.works_day1,
        works_day2: this.selectedVolunteer.works_day2,
        needs_parking_day1: this.selectedVolunteer.needs_parking_day1,
        needs_parking_day2: this.selectedVolunteer.needs_parking_day2,
        national_registry_number: this.selectedVolunteer.national_registry_number,
        tshirt_id: this.selectedVolunteer.tshirt_id,
        size_id: this.selectedVolunteer.size_id
      }
      
      this.apiService.updateVolunteer(Number(this.selectedVolunteer.id), volunteerToEdit).subscribe({
        next: (result) => {
          this.volunteerEdited = 'Vrijwilliger aangepast.';
          this.getVolunteers();
        },
        error: (error: HttpErrorResponse) => {
          this.errorVolunteerEdit = this.helperService.parseError(error);
          this.getVolunteers();
        }
      });
    }
  }

  // Delete Popup
  openDeleteModal(volunteer: Volunteer) {
    this.volunteerDeleted = '';
    this.errorVolunteerDeletion = '';

    this.selectedVolunteer = { ...volunteer };

    setTimeout(() => { 
      if (this.deleteModal) { 
        this.deleteModal.openModal();  
      }
    });
  }

  // delete
  deleteVolunteer() {
    this.volunteerDeleted = '';
    this.errorVolunteerDeletion = '';

    if (this.selectedVolunteer !== null && this.selectedVolunteer.id !== undefined) {
      this.apiService.deleteVolunteer(Number(this.selectedVolunteer.id)).subscribe({
        next: (result) => {
          this.volunteerDeleted = 'Vrijwilliger verwijderd.';
          this.getVolunteers();
        },
        error: (error: HttpErrorResponse) => {
          this.errorVolunteerDeletion = this.helperService.parseError(error);
        }
      });
    }
  }
}
