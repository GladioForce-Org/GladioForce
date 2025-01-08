import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TimeService } from '../services/time.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-volunteer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './volunteer.component.html',
  styleUrl: './volunteer.component.scss'
})
export class VolunteerComponent {
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
  );}



}
