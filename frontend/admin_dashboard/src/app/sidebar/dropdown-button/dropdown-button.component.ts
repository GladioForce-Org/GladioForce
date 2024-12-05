import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-button.component.html',
  styleUrl: './dropdown-button.component.scss'
})
export class DropdownButtonComponent {
  @Input() name: string = '';
  @Input() dropdownreference: string = '';
}
