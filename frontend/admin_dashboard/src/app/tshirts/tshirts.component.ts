import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AvailableTshirt, AvailableTshirtPatcher } from '../interfaces/available-tshirt';
import { Size } from '../interfaces/size';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';
import { Tshirt } from '../interfaces/tshirt';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { Edition } from '../interfaces/edition';
import { HelpersService } from '../services/helpers.service';
import { LoadingComponent } from "../components/loading/loading.component";
import { CustomDropdownComponent } from "../components/custom-dropdown/custom-dropdown.component";

@Component({
  selector: 'app-tshirts',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconButtonComponent, LoadingComponent, CustomDropdownComponent],
  templateUrl: './tshirts.component.html',
  styleUrl: './tshirts.component.scss'
})

export class TshirtsComponent implements OnInit, AfterViewInit {
  loading: boolean = false;
  loadingSizes: boolean = false;

  availableTshirts: AvailableTshirt[] = [];
  availableModels:  AvailableTshirt[] = [];
  currentYear: number | null = null;

  newTshirt: AvailableTshirt = {
    id: 0,
    tshirt_id: 0,
    model: '',
    sizes: [],
    price: ''
  };

  selectedTshirt: AvailableTshirt = this.newTshirt;
  selectedTshirtSizes: number[] = [];

  tshirtToDelete: AvailableTshirt | null = null;

  tshirtToEdit: AvailableTshirtPatcher | null = null;
  tshirtToEditSizes: number[] = [];

  sizeToCreate: string = '';
  availableSizes: Size[] = [];
  selectedModelId: number = 0;

  // Messages
  tshirtCreated: string = '';
  errorTshirtCreation: string = '';

  tshirtEdited: string = '';
  errorTshirtEdit: string = '';

  tshirtDeleted = '';
  errorTshirtDeletion = '';

  // Modal
  @ViewChild('editModal') editModal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(private apiService: ApiService, private helperService: HelpersService) {}

  ngOnInit(): void {
    this.loadCurrentEdition();
    this.loadTshirts();
    this.loadSizes();
    this.loadModels();
  }

  ngAfterViewInit(): void {
    // Ensure the modal is properly initialized
    if (this.editModal) {
      this.editModal.closeModal();
    }
  }

  CreateSize(): void {
    this.apiService.createSize({ size: this.sizeToCreate }).subscribe(() => {
      this.loadSizes();
    });
  }

  onModelChange(): void {
    if (this.selectedModelId != 0) { // Existing t-shirt
      this.selectedTshirt.tshirt_id = this.selectedModelId;

      // Fetch sizes for the selected model
      this.apiService.getSizesByTshirtId(this.selectedModelId).subscribe(
        (sizes) => { // Update sizes for the selected model
          this.selectedTshirt.sizes = sizes;

          this.selectedTshirtSizes = sizes.map((size: Size) => size.id); // Pre-select sizes for the selected model
        },
        (error) => {
          console.error('Error bij het ophalen van de maten voor het model:', error);
        }
      );
    } else { // New t-shirt
      this.resetNewTshirt();
      this.selectedTshirt = this.newTshirt;
    }
  }

  loadCurrentEdition() {
    this.apiService.getCurrentEdition().subscribe((data: Edition) => {
      this.currentYear = data.year;
    });
  }

  loadTshirts(): void {
    this.loading = true;

    this.apiService.getAvailableTshirts().subscribe((data: AvailableTshirt[]) => {
      this.availableTshirts = data;
      this.loading = false;
    });
  }

  loadModels(): void {
    this.apiService.getAllTshirts().subscribe((data: AvailableTshirt[]) => {
      this.availableModels = data;
    });
  }

  toggleSize(size: Size) {
    //selectedTshirt
    const index = this.selectedTshirtSizes.indexOf(size.id);
    if (index === -1) {
      this.selectedTshirt.sizes.push(size);
    } else {
      this.selectedTshirt.sizes.splice(index, 1);
    }

    this.selectedTshirtSizes = this.selectedTshirt.sizes.map((size: Size) => size.id);

    console.log(this.selectedTshirtSizes);

    if (this.selectedTshirt.tshirt_id != 0) {
      let patchModel: Tshirt = {
        sizes: this.selectedTshirtSizes
      };
      
      console.log('T-shirt patchen:', this.selectedTshirt.model);

      console.log('tshirt ID:', this.selectedTshirt.tshirt_id);

      this.apiService.updateTshirt(patchModel, this.selectedTshirt.tshirt_id).subscribe({
        next: (result) => {
          this.loadTshirts();
          this.loadModels();    
        },
        error: (error) => {
          console.error('Error bij het updaten van de t-shirt:', error);
        }
      });
    }
  }

  toggleEditSize(size: Size) {
    if(this.tshirtToEdit !== null) {
      const index = this.tshirtToEditSizes.indexOf(size.id);

      if (index === -1) {
        this.tshirtToEdit.sizes.push(size);
      } else {
        this.tshirtToEdit.sizes.splice(index, 1);
      }

      this.tshirtToEditSizes = this.tshirtToEdit.sizes.map((size: Size) => size.id);
    }
  }

  loadSizes(): void {
    this.loadingSizes = true;

    this.apiService.getSizes().subscribe(
      (sizes) => {
        this.availableSizes = sizes; // Load all available sizes
        this.loadingSizes = false;
        console.log('Alle maten opgehaald:', this.availableSizes);
      },
      (error) => {
        this.loadingSizes = false;
        console.error('Error bij het ophalen van de maten:', error);
      }
    );
  }

  createOrUpdateSize(): void {
    if (!this.sizeToCreate.trim()) {
      console.warn('Maat mag niet leeg zijn.');
      return;
    }

    const requestBody = { size: this.sizeToCreate.trim() };

    if (this.selectedModelId == 0) {
      console.log('Aanmaken van nieuwe maat:', this.sizeToCreate);
      // Create a new size
      this.apiService.createSize(requestBody).subscribe(
        () => {
          console.log('Maat aangemaakt:', this.sizeToCreate);
          this.loadSizes();
          this.sizeToCreate = '';
        },
        (error) => {
          console.error('Error bij het aanmaken van een maat:', error);
          if (error.status === 400) {
            console.error("Bad Request: Misschien bestaat de maat al of is ze niet geldig.");
          }
          else {
            console.error(this.helperService.parseError(error));
          }
        }
      );
    } else {
      // Patch the t-shirt with the updated sizes
      const updatedTshirt = { ...this.selectedTshirt, sizes: [...this.newTshirt.sizes, this.sizeToCreate.trim()] };
      this.apiService.updateTshirt(updatedTshirt, this.selectedModelId).subscribe(
        () => {
          console.log('T-shirt updated with new size:', this.sizeToCreate);
          this.loadTshirts();
          this.sizeToCreate = '';
        },
        (error) => {
          console.error(this.helperService.parseError(error));
        }
      );
    }
  }

  deleteSize(size: number): void {
    this.apiService.deleteSize(size).subscribe(() => {
      this.loadSizes();
    });
  }

  addTshirt(): void {
    this.apiService.addTshirt(this.newTshirt).subscribe(() => {
      this.loadTshirts();
      this.resetNewTshirt();
      this.tshirtCreated = 'T-shirt succesvol toegevoegd!';
      this.errorTshirtCreation = '';
    }, error => {
      this.errorTshirtCreation = this.helperService.parseError(error);
      this.tshirtCreated = '';
    });
  }
 
  resetSizes(): void {
    this.loadSizes();
    this.newTshirt.sizes = []; // Clear selected sizes
  }

  resetNewTshirt(): void {
    this.newTshirt = {
      id: 0,
      tshirt_id: 0,
      model: '',
      sizes: [],
      price: ''
    };
  }

  // Edit Popup
  openEditModal(tshirt: AvailableTshirt): void {
    this.tshirtToEdit = {
      id: tshirt.id,
      tshirt_id: tshirt.tshirt_id,
      model: tshirt.model,
      sizes: [...tshirt.sizes],
      price: tshirt.price
    }

    this.tshirtToEditSizes = this.tshirtToEdit.sizes.map((size: Size) => size.id);

    setTimeout(() => {
      if (this.editModal) {
        this.editModal.openModal();
      }
    });
  }

  // Edit
  updateTshirt(tshirt: AvailableTshirtPatcher): void {
    // remove ID from editObject to comply with the API
    let editObject = {
      tshirt_id: tshirt.tshirt_id,
      model: tshirt.model,
      sizes: tshirt.sizes,
      price: tshirt.price
    }

    this.apiService.updateAvailableTshirt(editObject, tshirt.id).subscribe(() => {
      this.loadTshirts();
      this.loadModels();
      this.tshirtEdited = 'T-shirt succesvol aangepast!';
      this.errorTshirtEdit = '';
    }, error => {
      this.errorTshirtEdit = this.helperService.parseError(error);
      this.tshirtEdited = '';
    });
  }

  // Delete Popup
  openDeleteModal(tshirt: AvailableTshirt) {
    this.tshirtDeleted = '';
    this.errorTshirtDeletion = '';
  
    this.tshirtToDelete = {...tshirt}; // {...} ensures a copy is made and not a reference

    setTimeout(() => { // Wait for the view to update
      if (this.deleteModal) { // Wait until the view is initialized (you may have to click twice the first time)
        this.deleteModal.openModal();  
      }
    });
  }

  // Delete
  deleteTshirt(): void {
    this.tshirtDeleted = '';
    this.errorTshirtDeletion = '';

    if (this.tshirtToDelete !== null) {
      this.apiService.deleteTshirt(this.tshirtToDelete.id).subscribe({
        next: (result) => {
          this.loadTshirts();
          this.tshirtDeleted = 'T-shirt verwijderd.';
        },
        error: (error) => {
          this.errorTshirtDeletion = this.helperService.parseError(error);
        }
      });
    }
  }
}