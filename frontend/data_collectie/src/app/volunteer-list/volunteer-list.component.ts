import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Volunteer } from '../data/types/volunteer';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../data/services/club.service';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volunteer-list.component.html',
  styleUrl: './volunteer-list.component.scss'
})
export class VolunteerListComponent implements OnInit {
  @Input() volunteers!: Volunteer[];

  clubLink: string = '';

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService,
  ) { }

  ngOnInit(): void {
    this.clubLink = this.route.snapshot.paramMap.get('link') ?? ''
    if (this.clubLink) {
      this.loadVolunteers(this.clubLink);
    }
  }

  private loadVolunteers(link: string): void {
    this.clubService.getVolunteersByClubLink(link).subscribe({
      next: (result) => { this.volunteers = result; },
      error: (error) => { console.error('Failed to load volunteers: ' + error.message); }
    });
  }

  protected editVolunteer(volunteerId: number): void {

  }

  protected deleteVolunteer(volunteerId: number): void {

  }

}
