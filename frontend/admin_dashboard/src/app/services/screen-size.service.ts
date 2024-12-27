import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
  private screenSizeSubject = new BehaviorSubject<string>('large'); // Default to 'large'
  screenSize$ = this.screenSizeSubject.asObservable();

  constructor() {
    this.updateScreenSize(); // Initialize screen size on load
    window.addEventListener('resize', this.onResize.bind(this));
  }

  // Listen to window resize events and update the screen size
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    //console.log('Window resized to:', window.innerWidth); // Debugging log
    this.updateScreenSize();
  }

  private updateScreenSize(): void {
    if (window.innerWidth < 640) {
      this.screenSizeSubject.next('small'); // Below 640px, consider it a small screen
    } else {
      this.screenSizeSubject.next('large'); // Above 640px, consider it a large screen
    }
  }
}