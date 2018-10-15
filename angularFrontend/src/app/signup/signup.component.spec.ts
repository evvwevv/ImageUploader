import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SignupComponent} from './signup.component';
import {CoreModule} from '../core/core.module';
import {SharedModule} from '../shared/shared.module';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        SharedModule
      ],
      declarations: [
        SignupComponent
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
