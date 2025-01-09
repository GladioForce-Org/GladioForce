import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubInfoFormComponent } from './club-info-form.component';

describe('ClubInfoFormComponent', () => {
  let component: ClubInfoFormComponent;
  let fixture: ComponentFixture<ClubInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubInfoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClubInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
