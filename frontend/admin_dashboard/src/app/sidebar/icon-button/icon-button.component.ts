import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherIconComponent } from '../../feather-icon/feather-icon.component';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule, FeatherIconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  @Input() linkName: string = '';
  @Input() link: string = ''
  @Input() icon: string = '';
}
