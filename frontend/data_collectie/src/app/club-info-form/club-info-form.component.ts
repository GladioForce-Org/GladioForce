import { Component, Input, OnInit } from '@angular/core';
import { Club } from '../data/types/club';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../data/services/club.service';
import { CommonModule } from '@angular/common';
import { validateBelgianBankAccount, validateEmail } from '../validators';

@Component({
  selector: 'app-club-info-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './club-info-form.component.html',
  styleUrl: './club-info-form.component.scss'
})
export class ClubInfoFormComponent implements OnInit {
  @Input() club!: Club;

  clubLink: string = '';

  isSubmitting = false;
  showSuccess = false;
  errorMessage = '';
  invalidBankAccount = false;
  invalidEmail = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clubService: ClubService) { }

  ngOnInit(): void {
    this.clubLink = this.route.snapshot.paramMap.get('link') || '';

    if (this.clubLink) {
      this.loadClubDetails();
    }
  }

  private loadClubDetails(): void {
    this.clubService.getClubByLink(this.club.link).subscribe({
      next: (result) => {
        this.club = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load club details: ' + error.message;
      }
    });
  }

  private updateClub(): void {
    this.clubService.patchClub(this.club.link, this.club).subscribe({
      next: () => {
        this.router.navigateByUrl(`/${this.club.link}`);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to update club: ' + error.message;
        this.isSubmitting = false;
      }
    });
  }

  protected onSubmit(form: NgForm): void {
    if (form.invalid) return;

    const bankAccountControl = form.form.get('bank_account');
    const emailControl = form.form.get('email');

    if (bankAccountControl && validateBelgianBankAccount(bankAccountControl)) {
      this.invalidBankAccount = true;
      return;
    }

    if (emailControl && validateEmail(emailControl)) {
      this.invalidEmail = true;
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.showSuccess = false;

    this.updateClub();
  }
}
