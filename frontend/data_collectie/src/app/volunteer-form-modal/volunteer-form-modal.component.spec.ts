import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerFormModalComponent } from './volunteer-form-modal.component';

describe('VolunteerFormModalComponent', () => {
  let component: VolunteerFormModalComponent;
  let fixture: ComponentFixture<VolunteerFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerFormModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VolunteerFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
