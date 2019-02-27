import { TestBed } from '@angular/core/testing';

import { StoreImageService } from './store-image.service';

describe('StoreImageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreImageService = TestBed.get(StoreImageService);
    expect(service).toBeTruthy();
  });
});
