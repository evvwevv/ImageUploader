import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SignupComponent} from './signup.component';
import {CoreModule} from '../core/core.module';
import {SharedModule} from '../shared/shared.module';
import {Router} from '@angular/router';


let mockRouter: any;

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async(() => {
    mockRouter = new MockRouter();
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        SharedModule
      ],
      declarations: [
        SignupComponent
      ],
      providers: [
        {provide: Router, useValue: mockRouter}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
