import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Club } from '../interfaces/club';
import { Volunteer } from '../interfaces/volunteer';
import { ClubService } from '../services/club.service';

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

  onSubmit(form: NgForm): void {
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

  protected editVolunteer(volunteerId: number): void {

  }

  protected deleteVolunteer(volunteerId: number): void {

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
}