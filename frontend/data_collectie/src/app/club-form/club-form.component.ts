import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Club } from '../interfaces/club';
import { Volunteer } from '../interfaces/volunteer';
import { ClubService } from '../services/club.service';
import { belgianBankAccountValidator } from '../validators/validators';

@Component({
  selector: 'app-club-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './club-form.component.html',
  styleUrl: './club-form.component.scss'
})
export class ClubFormComponent implements OnInit {
  isAdd: boolean = true;
  isEdit: boolean = false;

  clubId: number = 0;
  clubLink: string = '';

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
    private fb: FormBuilder
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
        console.log(result);
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
    this.isSubmitted = true;
    this.errorMessage = '';

    if (form.invalid) {
      return;
    }

    this.updateClub();
  }

  private updateClub(): void {
    this.clubService.putClub(this.club.id, this.club).subscribe({
      next: () => {
        this.router.navigateByUrl(`/${this.club.link}`);
      },
      error: (error) => {
        this.errorMessage = 'Failed to update club: ' + error.message;
        this.isSubmitted = false;
      }
    });
  }
}