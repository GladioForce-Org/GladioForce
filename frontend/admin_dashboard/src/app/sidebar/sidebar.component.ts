import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LinkComponent } from "./link/link.component";
import { DropdownButtonComponent } from "./dropdown-button/dropdown-button.component";
import { IconButtonLinkComponent } from "./icon-button-link/icon-button-link.component";
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { FeatherIconComponent } from '../components/feather-icon/feather-icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LinkComponent, DropdownButtonComponent, FeatherIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  email: string = localStorage.getItem('email') ?? 'Niet Aangemeld'; //provided by Authservice
  authenticatedMessage: string = localStorage.getItem('email') ? 'Aangemeld' : 'Niet Aangemeld'; //provided by Authservice

  apiUrl: string = environment.apiUrl + '/docs';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to the email changes from the AuthService
    this.authService.email$.subscribe((email) => {
      if (email) {
        localStorage.setItem('email', email);
      } else {
        localStorage.removeItem('email');
      }
      this.changeDetectorRef.detectChanges();
      this.apiUrl = environment.apiUrl + '/docs';
    });
  }
}
