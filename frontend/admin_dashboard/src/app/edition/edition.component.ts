import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Edition } from '../interfaces/edition';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HelpersService } from '../services/helpers.service';
import { ModalComponent } from '../components/modal/modal.component';
import { LoadingComponent } from "../components/loading/loading.component";

@Component({
  selector: 'app-edition',
  standalone: true,
  imports: [IconButtonComponent, CommonModule, FormsModule, ModalComponent, LoadingComponent],
  templateUrl: './edition.component.html',
  styleUrl: './edition.component.scss'
})
export class EditionComponent implements OnInit {
  public loading: boolean = false;

  editions: Edition[] = [];
  editionToCreate: Edition = { year: new Date().getFullYear(),  };

  // Messages
  editionCreated = '';
  errorEditionCreation = '';

  editionEdited = '';
  errorEditionEdit = '';

  editionDeleted = '';
  errorEditionDeletion = '';

  selectedEdition: Edition | null = null;

  //Modal
  @ViewChild('editModal') editModal!: ModalComponent;
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
    this.loading = true;

    this.apiService.getAllEditions().subscribe({
      next: (result) => {
        this.editions = result;
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  }

  // Create
  createEdition() {
    this.editionCreated = '';
    this.errorEditionCreation = '';
    
    this.apiService.createEdition(this.editionToCreate).subscribe({
      next: (result) => {
        this.editionCreated = 'Editie aangemaakt.';
        this.getEditions();
      },
      error: (error: HttpErrorResponse) => {
        this.errorEditionCreation = this.helperService.parseError(error);
      }
    });
  }

  // Edit Popup
  openEditModal(edition: Edition) {
    this.editionEdited = '';
    this.errorEditionEdit = '';  

    this.selectedEdition = {...edition}; // {...} ensures a copy is made and not a reference

    setTimeout(() => { // Wait for the view to update
      if (this.editModal) { // Wait until the view is initialized (you may have to click twice the first time)
        this.editModal.openModal();  
      }
    });
  }

  // Edit
  editEdition() {
    this.editionEdited = '';
    this.errorEditionEdit = '';
  
    if (this.selectedEdition !== null && this.selectedEdition.id !== undefined) {
      this.apiService.editEdition(this.selectedEdition.id, this.selectedEdition).subscribe({
        next: (result) => {
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

  // Delete Popup
  openDeleteModal(edition: Edition) {
    this.editionDeleted = '';
    this.errorEditionDeletion = '';
  
    this.selectedEdition = {...edition}; // {...} ensures a copy is made and not a reference

    setTimeout(() => { // Wait for the view to update
      if (this.deleteModal) { // Wait until the view is initialized (you may have to click twice the first time)
        this.deleteModal.openModal();  
      }
    });
  }

  // Delete
  deleteEdition() {
    this.editionDeleted = '';
    this.errorEditionDeletion = '';

    if (this.selectedEdition !== null && this.selectedEdition.id !== undefined) {
      this.apiService.deleteEdition(this.selectedEdition.id).subscribe({
        next: (result) => {
          this.getEditions();
          this.editionDeleted = 'Editie verwijderd.';
        },
        error: (error) => {
          this.errorEditionDeletion = this.helperService.parseError(error);
        }
      });
    }
  }
}
