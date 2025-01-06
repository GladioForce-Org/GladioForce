import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FeatherIconComponent } from "../feather-icon/feather-icon.component";

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FeatherIconComponent],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.scss'
})
export class CustomDropdownComponent {
  public dropdownOpen: boolean = false;

  @ViewChild('header') header!: ElementRef;
  @ViewChild('content') content!: ElementRef;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (
      this.header &&
      this.content &&
      this.dropdownOpen &&
      !this.header.nativeElement.contains(event.target) &&
      !this.content.nativeElement.contains(event.target)
    ) {
      this.dropdownOpen = false;
    }
  }
}

