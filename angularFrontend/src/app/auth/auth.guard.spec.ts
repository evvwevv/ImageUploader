import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';

let mockRouter:any;
    class MockRouter {
        navigate = jasmine.createSpy('navigate');
    }

describe('AuthGuard', () => {
  beforeEach(() => {
    mockRouter = new MockRouter();
    TestBed.configureTestingModule({
      providers: [AuthGuard, { provide: Router, useValue: mockRouter }]
    });
  });

  it('should be injectable', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
