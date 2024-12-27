import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Edition } from '../interfaces/edition';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HelpersService } from '../services/helpers.service';
import { ModalComponent } from '../components/modal/modal.component';

@Component({
  selector: 'app-edition',
  standalone: true,
  imports: [IconButtonComponent, CommonModule, FormsModule, ModalComponent],
  templateUrl: './edition.component.html',
  styleUrl: './edition.component.scss'
})
export class EditionComponent implements OnInit {
  editions: Edition[] = [];
  editionToCreate: Edition = { year: new Date().getFullYear(),  };

  // Messages
  editionCreated = '';
  errorEditionCreation = '';

  editionEdited = '';
  errorEditionEdit = '';

  selectedEdition: Edition | null = null;

  //Modal
  @ViewChild('modalComponent') modalComponent!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(
    private apiService: ApiService,
    private helperService: HelpersService
  ) {}

  async ngOnInit() {
    this.getEditions();
  }

  // Get editions
  private getEditions() {
    this.apiService.getAllEditions().subscribe({
      next: (result) => {
        this.editions = result;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Create
  createEdition() {
    this.editionCreated = '';
    this.errorEditionCreation = '';
    
    this.apiService.createEdition(this.editionToCreate).subscribe({
      next: (result) => {
        console.log(result);
        this.editionCreated = 'Editie aangemaakt.';

        this.getEditions();
      },
      error: (error: HttpErrorResponse) => {
        this.errorEditionCreation = this.helperService.parseError(error);
      }
    });
  }

  // Delete
  deleteEdition() {
    if (this.selectedEdition !== null && this.selectedEdition.id !== undefined) {
      this.apiService.deleteEdition(this.selectedEdition.id).subscribe({
        next: (result) => {
          this.getEditions();
        },
        error: (error) => {
          console.log(error);
        }
      });
    } else {
      console.log('Editie ID is niet gedefiniëerd.');
    }
  }

  // Edit
  editEdition() {
    this.editionEdited = '';
    this.errorEditionEdit = '';
  
    if (this.selectedEdition !== null && this.selectedEdition.id !== undefined) {
      this.apiService.editEdition(this.selectedEdition.id, this.selectedEdition).subscribe({
        next: (result) => {
          console.log(result);
          this.editionEdited = 'Editie aangepast.';
          this.getEditions();
        },
        error: (error: HttpErrorResponse) => {
          this.errorEditionEdit = this.helperService.parseError(error);
          this.getEditions();
        }
      });
    }
  }

  // Edit (Modal for popup and Edit Function)
  openModal(edition: Edition) {
    this.editionEdited = '';
    this.errorEditionEdit = '';  

    this.selectedEdition = edition;

    if (this.modalComponent) { // Wait until the view is initialized (you may have to click twice the first time but who cares)
      this.modalComponent.openModal();  
    }
  }

  openDeleteModal(edition: Edition) {
    this.selectedEdition = edition;

    if (this.deleteModal) { // Wait until the view is initialized (you may have to click twice the first time but who cares)
      this.deleteModal.openModal();  
    }
  }
}
