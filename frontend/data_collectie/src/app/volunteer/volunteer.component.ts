import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimeService } from '../data/services/time.service';
import { GladiolenLogoComponent } from '../gladiolen-logo/gladiolen-logo.component';

@Component({
  selector: 'app-volunteer',
  standalone: true,
  imports: [CommonModule, RouterModule, GladiolenLogoComponent],
  templateUrl: './volunteer.component.html',
  styleUrl: './volunteer.component.scss'
})
export class VolunteerComponent implements OnInit {
  clubId = Number(this.route.snapshot.paramMap.get('clubid'));
  volunteerId = Number(this.route.snapshot.paramMap.get('id'));
  volunteer: any;

  constructor(private route: ActivatedRoute, private http: HttpClient, private timeService: TimeService) { }

  ngOnInit(): void {
    this.loadVolunteer();
  }

  loadVolunteer(): void {
    this.timeService.getVolunteerByClubIdAndVolunteerId(this.clubId, this.volunteerId).subscribe({
      next: (result: any) => {
        this.volunteer = result;
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  //make a time registration
  makeRegistration(data: any): void {
    this.timeService.makeTimeRegistration(this.volunteerId).subscribe({
      next: (result: any) => {
        console.log(result);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
