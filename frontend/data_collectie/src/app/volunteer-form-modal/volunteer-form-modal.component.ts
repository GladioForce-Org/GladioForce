import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ClubService } from '../data/services/club.service';
import { Volunteer } from '../data/types/volunteer';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-volunteer-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volunteer-form-modal.component.html',
  styleUrl: './volunteer-form-modal.component.scss'
})
export class VolunteerFormModalComponent implements OnInit {
  @Input() isModalOpen!: boolean;
  @Output() modalClosed = new EventEmitter<void>();


  clubLink: string = '';

  invalidNationalRegistryNumber: boolean = false;
  nationalRegistryPattern: string = '\\d{2}\\.\\d{2}\\.\\d{2}-\\d{3}\\.\\d{2}';

  newVolunteer: Volunteer = {
    id: 0,
    first_name: '',
    last_name: '',
    works_day1: false,
    works_day2: false,
    needs_parking_day1: false,
    needs_parking_day2: false,
    tshirt_id: null,
    size_id: null,
    national_registry_number: '',
    works_day: '',
    needs_parking: ''
  };

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService
  ) { }

  ngOnInit(): void {
    this.clubLink = this.route.snapshot.paramMap.get('link') ?? ''
  }

  protected onSubmit(form: NgForm): void {

    this.addVolunteer();
    this.invalidNationalRegistryNumber = false;
  }

  private addVolunteer(): void {
    this.clubService.postVolunteer(this.clubLink, this.newVolunteer).subscribe({
      next: () => {
        // this.loadVolunteers();
      },
      error: (error) => {
        console.error('Failed to add volunteer: ' + error.message);
      }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalClosed.emit();
  }

  onWorksDayChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    // Reset parking selection if it is no longer valid
    if (value !== 'both' && this.newVolunteer.needs_parking === 'both') {
      this.newVolunteer.needs_parking = '';
    }
  }

  onParkingChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    switch (value) {
      case 'none':
        this.newVolunteer.needs_parking_day1 = false;
        this.newVolunteer.needs_parking_day2 = false;
        break;
      case 'day1':
        this.newVolunteer.needs_parking_day1 = true;
        this.newVolunteer.needs_parking_day2 = false;
        break;
      case 'day2':
        this.newVolunteer.needs_parking_day1 = false;
        this.newVolunteer.needs_parking_day2 = true;
        break;
      case 'both':
        this.newVolunteer.needs_parking_day1 = true;
        this.newVolunteer.needs_parking_day2 = true;
        break;
    }
  }
}
