import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-gladiolen-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gladiolen-logo.component.html',
  styleUrl: './gladiolen-logo.component.scss'
})
export class GladiolenLogoComponent {
  @Input() color: string = 'black';
  @Input() height: number = 90;
}
