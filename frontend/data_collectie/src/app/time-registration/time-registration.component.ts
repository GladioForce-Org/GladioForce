import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeService } from '../services/time.service';


@Component({
  selector: 'app-time-registration',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './time-registration.component.html',
  styleUrls: ['./time-registration.component.scss']
})
export class TimeRegistrationComponent {
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
