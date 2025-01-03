import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FeatherIconComponent } from "../../feather-icon/feather-icon.component";
import { CommonModule, NgClass } from '@angular/common';
import { IconButtonComponent } from "../icon-button/icon-button.component";
import { ScreenSizeService } from '../../services/screen-size.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FeatherIconComponent, NgClass, IconButtonComponent, CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit, OnDestroy {
  // User variables
  @Input() header: string = '';
  @Input() maxWidth: number = 0; // For a full screen modal don't set this!
  @Input() minHeight: number = 200; // Don't set this unless necessary

  // Other
  isModalOpen: boolean = false;
  isSidebarOpen: boolean = false; // Important for the positioning of the popup-window

  screenSize: string = '';

  private screenSizeSubscription: Subscription | null = null;

  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.screenSize$.subscribe((size: string) => {
      // IMPORTANT: Can be either 'small' or 'large' and is needed because of the sidebar states!
      this.screenSize = size;
      
      //console.log('Current screen size in modal:', this.screenSize);
    });
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.screenSizeSubscription !== null) {
      this.screenSizeSubscription.unsubscribe();
    }
  }

  openModal() {
    this.isModalOpen = true;
  }
  
  closeModal() {
    this.isModalOpen = false;
  }

  closeModalOnOutsideClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (targetElement.classList.contains('fixed')) {
      this.closeModal();
    }
  }
}
