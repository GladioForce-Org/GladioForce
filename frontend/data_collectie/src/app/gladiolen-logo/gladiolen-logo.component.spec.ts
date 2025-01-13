import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GladiolenLogoComponent } from './gladiolen-logo.component';

describe('GladiolenLogoComponent', () => {
  let component: GladiolenLogoComponent;
  let fixture: ComponentFixture<GladiolenLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GladiolenLogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GladiolenLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
