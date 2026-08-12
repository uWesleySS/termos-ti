import { TestBed } from '@angular/core/testing';

import { TermoPdfService } from './termo-pdf.service';

describe('TermoPdfService', () => {
  let service: TermoPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TermoPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
