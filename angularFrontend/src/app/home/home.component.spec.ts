import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {CoreModule} from '../core/core.module';
import {SharedModule} from '../shared/shared.module';
import {HttpClientModule} from '@angular/common/http';
import {Router} from '@angular/router';


let mockRouter: any;

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    mockRouter = new MockRouter();
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        SharedModule,
        HttpClientModule
      ],
      declarations: [
        HomeComponent
      ],
      providers: [
        {provide: Router, useValue: mockRouter}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render welcome text in an h2 tag', () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Sign in/Sign up to start uploading and sharing your own images');
  });
});
