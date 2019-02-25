import {TestBed} from '@angular/core/testing';

import {AuthService} from './auth.service';
import {Router} from '@angular/router';

let mockRouter: any;

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthService', () => {
  beforeEach(() => {
    mockRouter = new MockRouter();
    TestBed.configureTestingModule({
      providers: [{provide: Router, useValue: mockRouter}]
    });
  });

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});
