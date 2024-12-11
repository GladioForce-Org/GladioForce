import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LinkComponent } from "./link/link.component";
import { DropdownButtonComponent } from "./dropdown-button/dropdown-button.component";
import { IconButtonComponent } from "./icon-button/icon-button.component";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LinkComponent, DropdownButtonComponent, IconButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  email: string = ''; //provided by Authservice

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    // Subscribe to the email changes from the AuthService
    this.authService.email$.subscribe((email) => {
      this.email = email === null ? '' : email;
      console.log('SIDEBAR: ' + this.email);
      this.changeDetectorRef.detectChanges();
    });
  }
}
