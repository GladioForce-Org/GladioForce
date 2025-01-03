import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconButtonLinkComponent } from './icon-button-link.component';

describe('IconButtonComponent', () => {
  let component: IconButtonLinkComponent;
  let fixture: ComponentFixture<IconButtonLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IconButtonLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
