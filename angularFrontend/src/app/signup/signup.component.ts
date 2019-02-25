import {Component, OnInit, Inject} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from './../auth/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {ErrorDialogComponent} from '../home/home.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public signupForm: FormGroup;
  public confirmationForm: FormGroup;
  public successfullySignup: boolean;

  hide = true;
  email = new FormControl('', [Validators.required, Validators.email]);
  errorDialogRef: MatDialogRef<ErrorDialogComponent>;
  confirmErrorTitle = 'Account Confirmation Error';
  confirmErrorMsg = 'We were unable to confirm your account, please double check \
    your email to make sure your confirmation code is correct.';
  createErrorTitle = 'Account Creation Error';
  createErrorMsg = 'We were unable to create your account because the data you provided was invalid. \
    Please make sure your password is at least 8 characters and contains at least one number and that \
    your email address is valid.';

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
    this.signupForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.confirmationForm = this.fb.group({
      email: ['', Validators.required],
      confirmationCode: ['', Validators.required]
    });
  }

  onSubmitSignup(value: any) {
    const email = value.email,
      password = value.password;
    this.auth.signUp(email, password).subscribe(
      result => {
        this.successfullySignup = true;
      },
      error => {
        if (error.code === 'InvalidParameterException') {
          this.openErrorDialog(this.createErrorMsg, this.createErrorTitle);
        }
        console.log(error);
      }
    );
  }

  onSubmitConfirmation(value: any) {
    const email = value.email,
      confirmationCode = value.confirmationCode;
    this.auth.confirmSignUp(email, confirmationCode).subscribe(
      result => {
        this.auth.signIn(email, this.auth.password).subscribe(
          () => {
            this.router.navigate(['/']);
          },
          error => {
            console.log(error);
            this.router.navigate(['/login']);
          }
        );
      },
      error => {
        this.openErrorDialog(this.confirmErrorMsg, this.confirmErrorTitle);
        console.log(error);
      }
    );
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }
}
