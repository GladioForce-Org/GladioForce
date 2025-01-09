import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (!environment.production) {
      this.apiService.testAuth().subscribe((response) => {
        console.log(response);
      }, (error) => { console.error(error); });  
    }
  }
}
