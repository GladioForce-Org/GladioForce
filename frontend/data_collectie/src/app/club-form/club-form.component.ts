import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Club } from '../data/types/club';
import { Volunteer } from '../data/types/volunteer';
import { ClubService } from '../data/services/club.service';

@Component({
  selector: 'app-club-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './club-form.component.html',
  styleUrl: './club-form.component.scss'
})
export class ClubFormComponent implements OnInit {
  clubId: number = 0;
  clubLink: string = '';
  invalidBankAccount: boolean = false;
  invalidEmail: boolean = false;
  invalidNationalRegistryNumber: boolean = false;
  nationalRegistryPattern: string = '\\d{2}\\.\\d{2}\\.\\d{2}-\\d{3}\\.\\d{2}';
  newVolunteer: Volunteer = {
    id: 0,
    first_name: '',
    last_name: '',
    works_day1: false,
    works_day2: false,
    needs_parking_day1: false,
    needs_parking_day2: false,
    tshirt_id: null,
    size_id: null,
    national_registry_number: '',
    works_day: '',
    needs_parking: ''
  };

  club: Club = {
    id: 0,
    name: '',
    email: '',
    contact: '',
    phone: '',
    link: '',
    bank_account: '',
    BTW_number: '',
    address: '',
    postal_code: '',
    city: ''
  };

  volunteers: Volunteer[] = [];

  isSubmitted: boolean = false;
  errorMessage: string = '';

  isModalOpen: boolean = false;



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clubService: ClubService,
  ) { }

  ngOnInit(): void {
    this.clubLink = this.route.snapshot.paramMap.get('link') || '';

    if (this.clubLink) {
      this.loadClubDetails();
      this.loadVolunteers();
    }
  }

  loadClubDetails(): void {
    this.clubService.getClubByLink(this.clubLink).subscribe({
      next: (result) => {
        this.club = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load club details: ' + error.message;
      }
    });
  }

  loadVolunteers(): void {
    this.clubService.getVolunteersByClubLink(this.clubLink).subscribe({
      next: (result) => {
        this.volunteers = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load volunteers: ' + error.message;
      }
    });
  }

  onSubmitClubInfoForm(form: NgForm): void {
    const bankAccountControl = form.form.get('bank_account');
    if (bankAccountControl && this.validateBelgianBankAccount(bankAccountControl) !== null) {
      this.invalidBankAccount = true;
      return;
    }

    const emailControl = form.form.get('email');
    if (emailControl && this.validateEmail(emailControl) !== null) {
      this.invalidEmail = true;
      return;
    }

    const nationalRegistryControl = form.form.get('national_registry_number');
    if (nationalRegistryControl && this.validateNationalRegistryNumber(nationalRegistryControl) !== null) {
      return;
    }

    this.isSubmitted = true;
    this.errorMessage = '';

    if (form.invalid) {
      return;
    }

    this.updateClub();
    this.invalidBankAccount = false;
    this.invalidEmail = false;
  }

  private updateClub(): void {
    this.clubService.patchClub(this.club.link, this.club).subscribe({
      next: () => {
        this.router.navigateByUrl(`/${this.club.link}`);
        this.isSubmitted = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to update club: ' + error.message;
        this.isSubmitted = false;
      }
    });
  }

  protected onSubmitAddVolunteerForm(form: NgForm): void {

    this.addVolunteer();
    this.invalidNationalRegistryNumber = false;
  }

  private addVolunteer(): void {
    this.clubService.postVolunteer(this.club.link, this.newVolunteer).subscribe({
      next: () => {
        this.loadVolunteers();
      },
      error: (error) => {
        this.errorMessage = 'Failed to add volunteer: ' + error.message;
      }
    });
  }

  protected editVolunteer(volunteerId: number): void {

  }

  protected deleteVolunteer(volunteerId: number): void {

  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onWorksDayChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    // Reset parking selection if it is no longer valid
    if (value !== 'both' && this.newVolunteer.needs_parking === 'both') {
      this.newVolunteer.needs_parking = '';
    }
  }

  onParkingChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    switch (value) {
      case 'none':
        this.newVolunteer.needs_parking_day1 = false;
        this.newVolunteer.needs_parking_day2 = false;
        break;
      case 'day1':
        this.newVolunteer.needs_parking_day1 = true;
        this.newVolunteer.needs_parking_day2 = false;
        break;
      case 'day2':
        this.newVolunteer.needs_parking_day1 = false;
        this.newVolunteer.needs_parking_day2 = true;
        break;
      case 'both':
        this.newVolunteer.needs_parking_day1 = true;
        this.newVolunteer.needs_parking_day2 = true;
        break;
    }
  }

  private validateBelgianBankAccount(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Remove all spaces and convert to uppercase
    const cleanedValue = value.replace(/\s/g, '').toUpperCase();

    // Basic format check: BE + 14 digits
    if (!/^BE[0-9]{14}$/.test(cleanedValue)) {
      return { invalidBelgianBankAccount: true };
    }

    // Extract parts for validation
    const countryCode = cleanedValue.substring(0, 2);
    const checkDigits = cleanedValue.substring(2, 4);
    const bankCode = cleanedValue.substring(4, 7);
    const accountNumber = cleanedValue.substring(7);

    // Create checkable string: Move BE to end and convert to numbers (B=11, E=14)
    const rearranged = bankCode + accountNumber + '1114' + checkDigits;

    // Convert to number and check if modulo 97 equals 1
    const modResult = BigInt(rearranged) % 97n;

    return modResult === 1n ? null : { invalidBelgianBankAccount: true };
  }

  private validateEmail(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Basic format check: at least one character before and after @
    if (!/.+@.+\..+/.test(value)) {
      return { invalidEmail: true };
    }

    return null;
  }

  private validateNationalRegistryNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return { required: true };
    }

    const pattern = /^\d{2}\.\d{2}\.\d{2}-\d{3}\.\d{2}$/;
    if (!pattern.test(value)) {
      return { invalidFormat: true };
    }

    const [datePart, controlPart] = value.split('-');
    const [year, month, day] = datePart.split('.').map(Number);
    const [randomPart, checkPart] = controlPart.split('.').map(Number);

    const baseNumber = year >= 2000 ? `2${year}${month}${day}${randomPart}` : `${year}${month}${day}${randomPart}`;
    const checkNumber = 97 - (parseInt(baseNumber, 10) % 97);

    if (checkNumber !== checkPart) {
      return { invalidControlNumber: true };
    }

    return null;
  }
}