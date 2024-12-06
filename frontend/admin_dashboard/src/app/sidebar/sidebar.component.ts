import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LinkComponent } from "./link/link.component";
import { DropdownButtonComponent } from "./dropdown-button/dropdown-button.component";
import { IconButtonComponent } from "./icon-button/icon-button.component";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LinkComponent, DropdownButtonComponent, IconButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  constructor(
    private router: Router
  ) {}


}
