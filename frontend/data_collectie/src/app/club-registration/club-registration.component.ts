import { Component } from '@angular/core';
import { ClubInfoFormComponent } from "../club-info-form/club-info-form.component";
import { VolunteerListComponent } from "../volunteer-list/volunteer-list.component";
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../data/services/club.service';
import { Club } from '../data/types/club';
import { Volunteer } from '../data/types/volunteer';
import { VolunteerFormModalComponent } from "../volunteer-form-modal/volunteer-form-modal.component";

@Component({
  selector: 'app-club-registration',
  standalone: true,
  imports: [ClubInfoFormComponent, VolunteerListComponent, VolunteerFormModalComponent],
  templateUrl: './club-registration.component.html',
  styleUrl: './club-registration.component.scss'
})
export class ClubRegistrationComponent {
  club?: Club;
  volunteers?: Volunteer[];

  isModalOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService
  ) { }

  ngOnInit(): void {
    const link = this.route.snapshot.paramMap.get('link');
    if (link) {
      this.loadClubDetails(link);
      this.loadVolunteers(link);
    }
  }

  private loadClubDetails(link: string): void {
    this.clubService.getClubByLink(link).subscribe({
      next: (result) => this.club = result,
      error: (error) => console.error('Failed to load club:', error)
    });
  }

  private loadVolunteers(link: string): void {
    this.clubService.getVolunteersByClubLink(link).subscribe({
      next: (result) => {
        this.volunteers = result;
      },
      error: (error) => {
        console.error('Failed to load volunteers:', error);
      }
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  onModalClosed(): void {
    this.isModalOpen = false;
  }
}
