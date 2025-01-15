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

  festivalDay: number = 1; // Either 1 or 2

  registrationCount: number = 0;

  isUserCheckedIn: boolean = false;


  constructor(private route: ActivatedRoute, private http: HttpClient, private timeService: TimeService) { }

  ngOnInit(): void {
    this.loadVolunteer();

    // Load festival day from local storage
    const storedFestivalDay = localStorage.getItem('festivalDay');
    if (storedFestivalDay) {
      this.festivalDay = Number(storedFestivalDay);
    }

    this.loadRegistrationCount();
  }

  loadRegistrationCount() {
    this.timeService.getTimeRegistrationsCount(this.volunteerId, this.festivalDay).subscribe({
      next: (result: any) => {
        this.registrationCount = result;
        
        // Check if user is checked in
        this.isUserCheckedIn = this.registrationCount % 2 === 1;
      },
      error: (error: any) => {
        console.error(error);
      }
    });
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
  makeRegistration(): void {
    let data = {
      volunteer_id: this.volunteerId,
      day: this.festivalDay,
      start_time: !this.isUserCheckedIn,
      end_time: this.isUserCheckedIn
    };

    this.timeService.makeTimeRegistration(this.volunteerId, data).subscribe({
      next: (result: any) => {
        this.loadRegistrationCount();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  toggleFestivalDay(): void {
    this.festivalDay = this.festivalDay === 1 ? 2 : 1;

    //store festivalday in local storage
    localStorage.setItem('festivalDay', this.festivalDay.toString());

    this.loadRegistrationCount();
  }
}
