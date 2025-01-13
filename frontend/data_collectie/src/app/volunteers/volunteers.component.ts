import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeService } from '../data/services/time.service';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss'
})
export class VolunteersComponent {
  volunteers: any[] = [];
  constructor(private route: ActivatedRoute, private http: HttpClient, private timeService: TimeService) { }

  ngOnInit(): void {
    this.loadVolunteers();
  }

  loadVolunteers(): void {
    const clubId = Number(this.route.snapshot.paramMap.get('id'));
    this.timeService.getVolunteersByClubId(clubId).subscribe({
        next: (result: any) => {
          this.volunteers = result;
        },
        error: (error: any) => {
          console.error(error);
        }
      }
    );
  }

  //make a time registration
  makeRegistration(volunteerId: number, data: any): void {
    this.timeService.makeTimeRegistration(volunteerId, data).subscribe({
      next: (result: any) => {
        this.loadVolunteers();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
