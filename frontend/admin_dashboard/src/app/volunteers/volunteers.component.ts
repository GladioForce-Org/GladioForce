import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FeatherIconComponent } from "../components/feather-icon/feather-icon.component";

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, RouterModule, FeatherIconComponent],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss'
})
export class VolunteersComponent implements OnInit {
  club_id: number = -1;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.club_id = Number(params['id']);
    });
  }

}
