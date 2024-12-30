import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AvailableTshirt } from '../interfaces/available-tshirt';
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

  loadSizes(): void {
    this.apiService.getSizes().subscribe((data: string[]) => {
      this.newTshirt.sizes = data;
    });
  }

  createSize(): void {
    this.apiService.createSize(this.sizeToCreate).subscribe(() => {
      this.loadSizes();
      this.sizeToCreate = ''; // Reset the input field after creating the size
    }, error => {
      console.error('Er is een fout opgetreden bij het aanmaken van de maat.', error);
    });
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