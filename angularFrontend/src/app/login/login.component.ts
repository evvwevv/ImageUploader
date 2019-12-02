import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from './../auth/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {ErrorDialogComponent} from '../home/home.component';
import { EmailErrorStateMatcher } from '../signup/signup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  hide = true;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  requiredFormControl = new FormControl('', [Validators.required]);
  emailMatcher = new EmailErrorStateMatcher();
  errorDialogRef: MatDialogRef<ErrorDialogComponent>;
  errorTitle = 'Sign in Error';
  errorMsg = 'We were unable to sign you in, please make sure your email and password are correct.';

  constructor(private fb: FormBuilder,
              private router: Router,
              private auth: AuthService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.initForm();
  }

  openErrorDialog(errorMsg: string, errorTitle: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '450px',
      autoFocus: true,
      data: {errorMsg: errorMsg, errorTitle: errorTitle}
    });
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: this.emailFormControl,
      password: this.requiredFormControl
    });
  }

  onSubmitLogin(value: any) {
    const email = value.email,
      password = value.password;
    this.auth.signIn(email, password).subscribe(
      result => {
        this.router.navigate(['/']);
      },
      error => {
        this.openErrorDialog(this.errorMsg, this.errorTitle);
        console.log(error);
      }
    );
  }

}
