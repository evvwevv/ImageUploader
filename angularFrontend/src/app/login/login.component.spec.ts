import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginComponent} from './login.component';
import {CoreModule} from '../core/core.module';
import {SharedModule} from '../shared/shared.module';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        SharedModule
      ],
      declarations: [
        LoginComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
