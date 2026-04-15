import { TestBed } from '@angular/core/testing';

import { Publication } from './publication';

describe('Publication', () => {
  let service: Publication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Publication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
