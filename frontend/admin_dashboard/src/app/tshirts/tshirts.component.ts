import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AvailableTshirt } from '../interfaces/available-tshirt';
import { Size } from '../interfaces/size';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../components/modal/modal.component';

@Component({
  selector: 'app-tshirts',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './tshirts.component.html',
  styleUrl: './tshirts.component.scss'
})

export class TshirtsComponent implements OnInit {
  availableTshirts: AvailableTshirt[] = [];
  newTshirt: Omit<AvailableTshirt, 'edition_year'> = {
    id: 0,
    tshirt_id: 0,
    model: '',
    sizes: [],
    price: ''
  };
  selectedTshirt: AvailableTshirt | null = null;
  tshirtCreated: string = '';
  errorTshirtCreation: string = '';
  tshirtEdited: string = '';
  errorTshirtEdit: string = '';
  sizeToCreate: string = '';
  availableSizes: Size[] = [];
  dropdownOpen = false;
  selectedModelId: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadTshirts();
    this.loadSizes();
    
  }

  CreateSize(): void {
    this.apiService.createSize({ size: this.sizeToCreate }).subscribe(() => {
      this.loadSizes();
    });
  }

  onModelChange(): void {
    if (this.selectedModelId != 0) {
      // Fetch sizes for the selected model
      this.apiService.getSizesByTshirtId(this.selectedModelId).subscribe(
        (sizes) => { // Update sizes for the selected model
            this.newTshirt.sizes = sizes.map((size: Size) => size.size); // Pre-select sizes for the selected model
          console.log('Sizes for selected model:', this.availableSizes);
        },
        (error) => {
          console.error('Error fetching sizes for model:', error);
        }
      );
    } else {
      // Handle "Create New" by fetching all sizes
      this.apiService.getSizes().subscribe(
        (sizes) => {
          this.availableSizes = sizes; // Load all available sizes
          this.newTshirt.sizes = []; // Clear previously selected sizes
          console.log('All sizes reloaded for "Create New".');
        },
        (error) => {
          console.error('Error loading sizes for "Create New":', error);
        }
      );
    }
  }

  loadTshirts(): void {
    this.apiService.getAvailableTshirts().subscribe((data: AvailableTshirt[]) => {
      this.availableTshirts = data;

    });
  }

  toggleSize(size: string) {
    const index = this.newTshirt.sizes.indexOf(size);
      if (index === -1) {
        this.newTshirt.sizes.push(size);
      } else {
        this.newTshirt.sizes.splice(index, 1);
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
      this.selectedTshirt = null;
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