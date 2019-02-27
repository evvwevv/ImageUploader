import { TestBed } from '@angular/core/testing';

import { GalleryServiceService } from './gallery-service.service';

describe('GalleryServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GalleryServiceService = TestBed.get(GalleryServiceService);
    expect(service).toBeTruthy();
  });
});
