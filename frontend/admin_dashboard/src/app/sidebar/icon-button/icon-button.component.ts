import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  @Input() linkName: string = '';
  @Input() link: string = ''
}
