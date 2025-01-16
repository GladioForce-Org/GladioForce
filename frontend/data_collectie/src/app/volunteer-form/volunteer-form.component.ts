import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Volunteer } from '../data/types/volunteer';
import { AvailableTshirt } from '../data/types/available_tshirt';
import { TshirtService } from '../data/services/tshirt.service';
import { VolunteerService } from '../data/services/volunteer.service';
import { Size } from '../data/types/size';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-volunteer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './volunteer-form.component.html',
  styleUrl: './volunteer-form.component.scss'
})
export class VolunteerFormComponent implements OnInit {
  @Input() edition_id: number = 1;
  @Input() volunteer: Volunteer = {
    id: 0,
    first_name: '',
    last_name: '',
    works_day1: false,
    works_day2: false,
    tshirt_id: null,
    size_id: null,
    needs_parking_day1: false,
    needs_parking_day2: false,
    needs_parking: null,
    works_day: null
  };
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() clubLink!: string;
  @Output() save = new EventEmitter<Volunteer>();
  @Output() close = new EventEmitter<void>();
  @Output() saveSuccess = new EventEmitter<void>();

  availableTshirts: AvailableTshirt[] = [];
  availableSizes: Size[] = [];

  constructor(
    private tshirtService: TshirtService,
    private volunteerService: VolunteerService
  ) { }

  ngOnInit(): void {
    this.loadAvailableTshirts();
  }

  onSave() {
    this.save.emit(this.volunteer);
  }

  cancel(form: NgForm): void {
    this.resetForm(form);
    this.close.emit();
  }

  private loadAvailableTshirts(): void {
    this.tshirtService.getAvailableTshirtsCurrentEdition().subscribe({
      next: (result) => {
        this.availableTshirts = result;
      }
    });
  }

  protected onSubmit(form: NgForm): void {
    const formValue = {
      ...form.value,
      id: this.volunteer.id
    };

    // Rest of conversion logic
    formValue.works_day1 = formValue.works_day === 'day1' || formValue.works_day === 'both';
    formValue.works_day2 = formValue.works_day === 'day2' || formValue.works_day === 'both';
    delete formValue.works_day;

    formValue.needs_parking_day1 = formValue.needs_parking === 'day1' || formValue.needs_parking === 'both';
    formValue.needs_parking_day2 = formValue.needs_parking === 'day2' || formValue.needs_parking === 'both';
    delete formValue.needs_parking;

    const operation = this.isEdit
      ? this.volunteerService.patchVolunteer(this.clubLink, formValue)
      : this.volunteerService.postVolunteer(this.clubLink, formValue);

    operation.subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.close.emit();
        this.resetForm(form);
      },
      error: (err) => {
        console.error('Save operation failed:', err);
        console.error('Form value:', formValue);
      }
    });
  }

  private resetForm(form: NgForm): void {
    form.resetForm({
      id: 0,
      first_name: '',
      last_name: '',
      works_day1: false,
      works_day2: false,
      tshirt_id: null,
      size_id: null,
      needs_parking_day1: false,
      needs_parking_day2: false,
      needs_parking: null,
      works_day: null
    });
  }

  private updateAvailableSizes(tshirtId: number): void {
    this.availableSizes = this.availableTshirts.find(tshirt => tshirt.id === tshirtId)?.sizes || [];
  }

  protected onTshirtModelChange(event: any): void {
    const selectedTshirtId = this.volunteer.tshirt_id;
    if (selectedTshirtId) {
      this.updateAvailableSizes(selectedTshirtId);
      this.volunteer.size_id = null; // Reset size when model changes
    }
  }

  protected onWorksDayChange(event: any): void {
    const worksDay = event.target.value;

  }

  private updateNeedsParking(): void {

  }
}
