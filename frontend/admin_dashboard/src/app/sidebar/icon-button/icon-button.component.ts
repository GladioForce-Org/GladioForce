import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherIconComponent } from '../../feather-icon/feather-icon.component';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule, FeatherIconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent implements OnInit {
  @Input() linkName: string = '';
  @Input() link: string = ''
  @Input() icon: string = '';
  @Input() tooltipReference: string = '';

  async ngOnInit() {
    console.log('ICON BUTTON: ' + this.linkName);
  }
}
