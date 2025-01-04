import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AvailableTshirt } from '../interfaces/available-tshirt';
import { Size } from '../interfaces/size';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';
import { Tshirt } from '../interfaces/tshirt';
import { IconButtonComponent } from '../components/icon-button/icon-button.component';
import { Edition } from '../interfaces/edition';


@Component({
  selector: 'app-tshirts',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconButtonComponent],
  templateUrl: './tshirts.component.html',
  styleUrl: './tshirts.component.scss'
})

export class TshirtsComponent implements OnInit, AfterViewInit {
  availableTshirts: AvailableTshirt[] = [];
  avaialbleModels:  AvailableTshirt[] = [];
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

  tshirtCreated: string = '';
  errorTshirtCreation: string = '';
  tshirtEdited: string = '';
  errorTshirtEdit: string = '';
  sizeToCreate: string = '';
  availableSizes: Size[] = [];
  dropdownOpen = false;
  selectedModelId: number = 0;
  @ViewChild('editModal') editModal!: ModalComponent;

  constructor(private apiService: ApiService) {}

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
          console.error('Error fetching sizes for model:', error);
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
    this.apiService.getAvailableTshirts().subscribe((data: AvailableTshirt[]) => {
      this.availableTshirts = data;
    });
  }

  loadModels(): void {
    this.apiService.getAllTshirts().subscribe((data: AvailableTshirt[]) => {
      this.avaialbleModels = data;
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
      
      console.log('patching tshirt:', this.selectedTshirt.model);

      console.log('tshirt ID:', this.selectedTshirt.tshirt_id);

      this.apiService.updateTshirt(patchModel, this.selectedTshirt.tshirt_id).subscribe({
        next: (result) => {
          this.loadTshirts();
          this.loadModels();    
        },
        error: (error) => {
          console.error('Error updating tshirt:', error);
        }
      });
    }
  }

  loadSizes(): void {
    this.apiService.getSizes().subscribe(
      (sizes) => {
        this.availableSizes = sizes; // Load all available sizes
        console.log('All sizes loaded:', this.availableSizes);
      },
      (error) => {
        console.error('Error loading all sizes:', error);
      }
    );
  }

  createOrUpdateSize(): void {
    if (!this.sizeToCreate.trim()) {
      console.warn('Size cannot be empty.');
      return;
    }

    const requestBody = { size: this.sizeToCreate.trim() };

    if (this.selectedModelId == 0) {
      console.log('Creating new size:', this.sizeToCreate);
      // Create a new size
      this.apiService.createSize(requestBody).subscribe(
        () => {
          console.log('Size created:', this.sizeToCreate);
          this.loadSizes();
          this.sizeToCreate = '';
        },
        (error) => {
          console.error('Error creating size:', error);
          if (error.status === 400) {
            console.error("Bad Request: Perhaps the size already exists or is invalid.");
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
          console.error('Error updating t-shirt with new size:', error);
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
      this.errorTshirtCreation = 'Er is een fout opgetreden bij het toevoegen van de T-shirt.';
      this.tshirtCreated = '';
    });
  }

  updateTshirt(tshirt: AvailableTshirt): void {
    this.apiService.updateTshirt(tshirt, tshirt.id).subscribe(() => {
      this.loadTshirts();
      this.tshirtEdited = 'T-shirt succesvol aangepast!';
      this.errorTshirtEdit = '';
    }, error => {
      this.errorTshirtEdit = 'Er is een fout opgetreden bij het aanpassen van de T-shirt.';
      this.tshirtEdited = '';
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  deleteTshirt(id: number): void {
    this.apiService.deleteTshirt(id).subscribe(() => {
      this.loadTshirts();
    });
  }

  openEditModal(tshirt: AvailableTshirt): void {
    this.selectedTshirt = { ...tshirt };
    setTimeout(() => {
      if (this.editModal) {
        this.editModal.openModal();
      }
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
}