import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link.component.html',
  styleUrl: './link.component.scss',
})
export class LinkComponent implements OnInit {
  @Input() linkName: string = '';
  @Input() link: string = ''
  @Input() hasIcon: boolean = false
  css: String = 'flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-purple-400 dark:text-white dark:hover:bg-gray-700 group'

  async ngOnInit() {
    if (this.hasIcon) {
      //this.css = 'flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-purple-400 dark:hover:bg-gray-700 group'
      this.css = "flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-purple-400 dark:hover:bg-gray-700 dark:text-white group"
    }
  }
}
