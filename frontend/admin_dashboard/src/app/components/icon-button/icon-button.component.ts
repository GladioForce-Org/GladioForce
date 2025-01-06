import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherIconComponent } from '../feather-icon/feather-icon.component';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule, FeatherIconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  @Input() tooltip: string = '';
  @Input() icon: string = '';
  @Input() tooltipReference: string = '';

  @Output() clickEvent = new EventEmitter<void>();

  onClick() {
    this.clickEvent.emit();
  }
}
