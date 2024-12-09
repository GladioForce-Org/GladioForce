import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Club } from '../interfaces/club';
import { ClubService } from '../services/club.service';

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

  club: Club = {
    id: 0,
    name: '',
    email: '',
    contact: '',
    phone_number: '',
    link: '',
    bank_account: '',
    BTW_number: '',
    adress: '',
    postal_code: '',
    city: ''
  };

  isSubmitted: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private clubService: ClubService
  ) { }

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state || {};

    this.isEdit = state['mode'] === 'edit';

    this.clubId = +state['id'];

    if (this.clubId && this.clubId > 0) {
      this.loadClubDetails();
    }
  }

  loadClubDetails(): void {
    this.clubService.getClubById(this.clubId).subscribe({
      next: (result) => {
        this.club = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load club details: ' + error.message;
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
    this.clubService.putClub(this.clubId, this.club).subscribe({
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