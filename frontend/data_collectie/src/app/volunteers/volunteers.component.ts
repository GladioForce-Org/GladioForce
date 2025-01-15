import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeService } from '../data/services/time.service';
import { GladiolenLogoComponent } from "../gladiolen-logo/gladiolen-logo.component";

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, RouterModule, GladiolenLogoComponent],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss'
})
export class VolunteersComponent implements OnInit {
  clubId: number = Number(this.route.snapshot.paramMap.get('id'));
  volunteers: any[] = [];
  constructor(private route: ActivatedRoute, private http: HttpClient, private timeService: TimeService) { }

  ngOnInit(): void {
    this.loadVolunteers();
  }

  loadVolunteers(): void {
    this.timeService.getVolunteersByClubId(this.clubId).subscribe({
        next: (result: any) => {
          this.volunteers = result;
        },
        error: (error: any) => {
          console.error(error);
        }
      }
    );
  }
}
