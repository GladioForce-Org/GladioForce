import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatherIconComponent } from './feather-icon.component';

describe('FeatherIconComponent', () => {
  let component: FeatherIconComponent;
  let fixture: ComponentFixture<FeatherIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatherIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatherIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
