import { TestBed } from '@angular/core/testing';

import { TshirtService } from './tshirt.service';

describe('TshirtService', () => {
  let service: TshirtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TshirtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
