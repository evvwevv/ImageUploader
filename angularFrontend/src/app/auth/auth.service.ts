import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, from, of, Subject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import Amplify, { Auth } from 'aws-amplify';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn: BehaviorSubject<boolean>;
  password: String;
  constructor(private router: Router) {
    Amplify.configure(environment.amplify);
    this.loggedIn = new BehaviorSubject<boolean>(false);
  }

  public signUp(email, password): Observable<any> {
    this.password = password;
    return from(Auth.signUp(email, password, email));
  }

  public confirmSignUp(email, code): Observable<any> {
    return from(Auth.confirmSignUp(email, code));
  }

  public signIn(email, password): Observable<any> {
    return from(Auth.signIn(email, password)).pipe(
      tap(() => this.loggedIn.next(true))
    );
  }

  public getData(): Observable<any> {
    return from(Auth.currentAuthenticatedUser());
  }

  public getIdToken(): string {
    return Auth.currentSession()['__zone_symbol__value']['idToken']['jwtToken'];
  }

  public isAuthenticated(): Observable<boolean> {
    return from(Auth.currentAuthenticatedUser()).pipe(
      map(result => {
        this.loggedIn.next(true);
        return true;
      }),
      catchError(error => {
        this.loggedIn.next(false);
        return of(false);
      })
    );
  }

  public signOut() {
    from(Auth.signOut()).subscribe(
      result => {
        this.loggedIn.next(false);
        this.router.navigate(['/login']);
      },
      error => console.log(error)
    );
  }
}
