import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../api-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  constructor(private apiService: ApiServiceService) {}

  ngOnInit(): void {
    this.apiService.testAuth().subscribe((response) => {
      console.log(response);
    }, (error) => { console.error(error); });
  }
}
