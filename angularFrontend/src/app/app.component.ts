import { Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked{
  title = 'angularFrontend';
  subscription: Subscription;
  username: String;
  loggedIn: boolean;

  constructor(private router: Router, public auth: AuthService, private cdr: ChangeDetectorRef) {
    /*this.username = localStorage.getItem(
      environment.localstorageBaseKey + 'LastAuthUser'
    );Need to setup aws environment in environment.ts, but dont have acc ;-;*/
  }

  ngOnInit() {
    this.subscription = this.auth.isAuthenticated().subscribe(result => {
      this.loggedIn = result;
    });
  }

  ngAfterViewChecked() {
    /*this.username = localStorage.getItem(
      environment.localstorageBaseKey + 'LastAuthUser'
    );Need to setup aws environment in environment.ts, but dont have acc ;-;*/
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onClickLogout() {
    this.auth.signOut();
  }

  public onUploadClick(){
    this.router.navigate(['./']);
  }

  public onSignInClick(){
    this.router.navigate(['./login']);
  }

  public onNewUserClick(){
    this.router.navigate(['./signup']);
  }


}
