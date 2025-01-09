import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Volunteer } from '../data/types/volunteer';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../data/services/club.service';
import { VolunteerService } from '../data/services/volunteer.service';
import { VolunteerFormComponent } from "../volunteer-form/volunteer-form.component";
import { SortState } from '../data/types/sort_state';
import { FormsModule } from '@angular/forms';
import { AvailableTshirt } from '../data/types/available_tshirt';
import { TshirtService } from '../data/services/tshirt.service';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule, VolunteerFormComponent, FormsModule],
  templateUrl: './volunteer-list.component.html',
  styleUrl: './volunteer-list.component.scss'
})
export class VolunteerListComponent implements OnInit {
  @Output() volunteersChange = new EventEmitter<Volunteer[]>();

  clubLink!: string;
  volunteers!: Volunteer[];
  availableTshirts: AvailableTshirt[] = [];

  sortState: SortState = {
    column: '',
    direction: ''
  };

  searchTerm: string = '';

  isEdit: boolean = false;
  isModalOpen: boolean = false;

  selectedVolunteer: Volunteer = {
    id: 0,
    first_name: '',
    last_name: '',
    works_day1: false,
    works_day2: false,
    needs_parking_day1: false,
    needs_parking_day2: false,
    tshirt_id: null,
    size_id: null,
  };

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService,
    private volunteerService: VolunteerService,
    private tshirtService: TshirtService
  ) { }

  ngOnInit(): void {
    this.clubLink = this.route.snapshot.paramMap.get('link') || '';
    if (this.clubLink) {
      this.loadVolunteers(this.clubLink);
      this.loadTshirts();
    }
  }

  private loadTshirts(): void {
    this.tshirtService.getAvailableTshirtsCurrentEdition().subscribe({
      next: (result) => {
        this.availableTshirts = result;
        this.volunteersChange.emit(this.volunteers);
      }
    });
  }

  getTshirtModel(tshirtId: number | null): string {
    const tshirt = this.availableTshirts.find(t => t.id === tshirtId);
    return tshirt ? tshirt.model : '-';
  }

  getTshirtSize(tshirtId: number | null, sizeId: number | null): string {
    if (!tshirtId || !sizeId) return '-';
    const tshirt = this.availableTshirts.find(t => t.id === tshirtId);
    const size = tshirt?.sizes.find(s => s.id === sizeId);
    return size ? size.size : '-';
  }

  get filteredVolunteers(): Volunteer[] {
    return this.volunteers?.filter(volunteer => {
      const fullName = `${volunteer.first_name} ${volunteer.last_name}`.toLowerCase();
      return fullName.includes(this.searchTerm.toLowerCase());
    }) || [];
  }

  private loadVolunteers(link: string): void {
    this.volunteerService.getVolunteersByClubLink(link).subscribe({
      next: (result) => {
        this.volunteers = result;
        this.volunteersChange.emit(this.volunteers);
      },
      error: (error) => {
        console.error('Failed to load volunteers:', error);
      }
    });
  }

  protected openAddModal(): void {
    this.isEdit = false;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedVolunteer = {
      id: 0,
      first_name: '',
      last_name: '',
      works_day1: false,
      works_day2: false,
      needs_parking_day1: false,
      needs_parking_day2: false,
      tshirt_id: null,
      size_id: null,
      needs_parking: null,
      works_day: null
    };
  }

  protected openEditModal(volunteer: Volunteer): void {
    this.isEdit = true;
    this.selectedVolunteer = {
      ...volunteer,
      works_day: this.getWorksDay(volunteer),
      needs_parking: this.getNeedsParking(volunteer)
    };
    this.isModalOpen = true;
  }

  deleteVolunteer(volunteerId: number): void {
    if (confirm('Weet je zeker dat je deze vrijwilliger wilt verwijderen?')) {
      this.volunteerService.deleteVolunteer(this.clubLink, volunteerId).subscribe(() => {
        this.loadVolunteers(this.clubLink);
      });
    }
  }

  onSaveSuccess(): void {
    this.loadVolunteers(this.clubLink);
    this.closeModal();
  }

  private getWorksDay(volunteer: Volunteer): string {
    if (volunteer.works_day1 && volunteer.works_day2) return 'both';
    if (volunteer.works_day1) return 'day1';
    if (volunteer.works_day2) return 'day2';
    return 'none';
  }

  private getNeedsParking(volunteer: Volunteer): string {
    if (volunteer.needs_parking_day1 && volunteer.needs_parking_day2) return 'both';
    if (volunteer.needs_parking_day1) return 'day1';
    if (volunteer.needs_parking_day2) return 'day2';
    return 'none';
  }

  sort(column: string): void {
    const direction = this.sortState.column === column
      ? this.sortState.direction === 'asc' ? 'desc' : 'asc'
      : 'asc';

    this.sortState = { column, direction };

    this.volunteers.sort((a: any, b: any) => {
      const aValue = this.getNestedValue(a, column);
      const bValue = this.getNestedValue(b, column);

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return direction === 'desc' ? comparison * -1 : comparison;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, i) => o[i], obj);
  }

  getSortIcon(column: string): string {
    if (this.sortState.column !== column) return '↕';
    return this.sortState.direction === 'asc' ? '↑' : '↓';
  }
}
