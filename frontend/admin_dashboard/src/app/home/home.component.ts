import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService) {
    
  }

  email: string | null = ''; //provided by Authservice

  async ngOnInit() {
    // Subscribe to the email changes from the AuthService
    this.authService.email$.subscribe((email) => {
      this.email = email;
      // this.changeDetectorRef.detectChanges();
    });
  }

}
