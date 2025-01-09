import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Club } from '../interfaces/club';
import { ApiService } from '../services/api.service';
import { HelpersService } from '../services/helpers.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';
import { LoadingComponent } from '../components/loading/loading.component';
import { IconButtonLinkComponent } from '../sidebar/icon-button-link/icon-button-link.component';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [RouterModule, CommonModule, IconButtonLinkComponent, FormsModule, ModalComponent, LoadingComponent],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss'
})
export class VolunteersComponent implements OnInit {
  club_id: number = -1;
  club: Club | undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private helperService: HelpersService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.club_id = Number(params['id']);
    });

    this.apiService.getClub(this.club_id).subscribe({
      next: (result) => {
        this.club = result;
        console.log(this.club);
      },
      error: (error) => {
        console.log(this.helperService.parseError(error));
      }
    });
  }
}
