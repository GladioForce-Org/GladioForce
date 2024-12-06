import { CommonModule } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-feather-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feather-icon.component.html',
  styleUrls: ['./feather-icon.component.scss']
})
export class FeatherIconComponent implements OnInit {
  @Input() icon: string = '';
  @Input() size = 24;
  @Input() filled = false;

  @Input() disabled = false;

  constructor() { }

  ngOnInit() {

  }

  dummy($event: Event) {
    if (this.disabled) {
      $event.stopPropagation();
    }
  }
}
