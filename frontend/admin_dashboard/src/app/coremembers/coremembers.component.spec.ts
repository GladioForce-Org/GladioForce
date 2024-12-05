import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoremembersComponent } from './coremembers.component';

describe('CoremembersComponent', () => {
  let component: CoremembersComponent;
  let fixture: ComponentFixture<CoremembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoremembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoremembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
