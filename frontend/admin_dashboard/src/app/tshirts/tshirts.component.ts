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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadTshirts();
    this.loadSizes();
    
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
    this.apiService.getSizes().subscribe((data: any[]) => {
      this.availableSizes = data;
      console.log(this.availableSizes);
    });
  }

  createSize(): void {
    if (!this.sizeToCreate.trim()) {
      // Optional: Prevent sending empty strings
      console.warn('Size cannot be empty.');
      return;
    }

    const requestBody = { size: this.sizeToCreate.trim() }; // Create the request body object

    this.apiService.createSize(requestBody).subscribe(
      () => {
        console.log('Size created:', this.sizeToCreate); // More informative log
        this.loadSizes();
        this.sizeToCreate = '';
      },
      (error) => {
        console.error('Error creating size:', error); // More informative error log
        // Optionally handle specific error codes and display messages to the user
        if (error.status === 400) {
          console.error("Bad Request: Perhaps the size already exists or is invalid.")
        }
      }
    );
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

  deleteTshirt(id: number): void {
    this.apiService.deleteTshirt(id).subscribe(() => {
      this.loadTshirts();
    });
  }

  openEditModal(tshirt: AvailableTshirt): void {
    this.selectedTshirt = { ...tshirt };
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