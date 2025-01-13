import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeService } from '../data/services/time.service';
import { GladiolenLogoComponent } from "../gladiolen-logo/gladiolen-logo.component";

@Component({
  selector: 'app-time-registration',
  standalone: true,
  imports: [CommonModule, RouterModule, GladiolenLogoComponent],
  templateUrl: './time-registration.component.html',
  styleUrl: './time-registration.component.scss'
})
export class TimeRegistrationComponent implements OnInit {
  constructor(private timeService: TimeService) {}

  loading: boolean = false;
  clubs: any[] = [];

  ngOnInit(): void {
    this.loadClubs();
  }
  
  loadClubs(): void {
    this.loading = true;
    this.timeService.getAvailableClubs().subscribe({
      next: (result: any) => {
        this.clubs = result;
        this.loading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
      }
    });
  }


}
