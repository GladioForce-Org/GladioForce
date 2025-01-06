import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FeatherIconComponent } from '../../components/feather-icon/feather-icon.component';

@Component({
  selector: 'app-dropdown-button',
  standalone: true,
  imports: [CommonModule, FeatherIconComponent],
  templateUrl: './dropdown-button.component.html',
  styleUrl: './dropdown-button.component.scss'
})
export class DropdownButtonComponent {
  @Input() name: string = '';
  @Input() dropdownreference: string = '';
  @Input() icon: string = '';
  public isDropdownOpen: boolean = false;

  public toggleDropdown() {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    } else {
      this.isDropdownOpen = true;
    }
  }
}
