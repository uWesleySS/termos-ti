import { TestBed } from '@angular/core/testing';

import { TermoApiService } from './termo-api.service';

describe('TermoApiService', () => {
  let service: TermoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TermoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
