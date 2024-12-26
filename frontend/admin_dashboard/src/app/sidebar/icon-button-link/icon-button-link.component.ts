import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherIconComponent } from '../../feather-icon/feather-icon.component';

@Component({
  selector: 'app-icon-button-link',
  standalone: true,
  imports: [CommonModule, FeatherIconComponent],
  templateUrl: './icon-button-link.component.html',
  styleUrl: './icon-button-link.component.scss'
})
export class IconButtonLinkComponent {
  @Input() linkName: string = '';
  @Input() link: string = ''
  @Input() icon: string = '';
  @Input() tooltipReference: string = '';
}
