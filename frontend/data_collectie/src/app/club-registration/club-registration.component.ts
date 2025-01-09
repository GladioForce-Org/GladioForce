import { Component } from '@angular/core';
import { ClubInfoFormComponent } from "../club-info-form/club-info-form.component";
import { VolunteerListComponent } from "../volunteer-list/volunteer-list.component";
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../data/services/club.service';
import { Club } from '../data/types/club';
import { Title } from '@angular/platform-browser';
import { Volunteer } from '../data/types/volunteer';

@Component({
  selector: 'app-club-registration',
  standalone: true,
  imports: [ClubInfoFormComponent, VolunteerListComponent],
  templateUrl: './club-registration.component.html',
  styleUrl: './club-registration.component.scss'
})
export class ClubRegistrationComponent {
  clubLink!: string;
  club?: Club;
  currentEditionId: number = 1;
  volunteers: Volunteer[] = [];

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService,
    private titleService: Title,
  ) { }

  ngOnInit(): void {
    this.clubLink = this.route.snapshot.paramMap.get('link') || '';
    if (this.clubLink) {
      this.loadClubDetails(this.clubLink);
    }
  }

  onVolunteersChange(updatedVolunteers: Volunteer[]): void {
    this.volunteers = updatedVolunteers;
  }

  private loadClubDetails(link: string): void {
    this.clubService.getClubByLink(link).subscribe({
      next: (result) => {
        this.club = result;
        this.titleService.setTitle(`Gladiolen - ${this.club?.name}`);
      },
      error: (error) => console.error('Failed to load club:', error)
    });
  }
}
