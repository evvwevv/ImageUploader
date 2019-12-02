import {Component, OnInit, Inject} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from './../auth/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {ErrorDialogComponent} from '../home/home.component';
import {ErrorStateMatcher} from '@angular/material/core';

export class EmailErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const invalidCtrl = !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    return invalidCtrl;
  }
}

export class PasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

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
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  requiredFormControl = new FormControl('', [Validators.required]);
  requiredConfirmFormControl = new FormControl('', [Validators.required]);
  emailMatcher = new EmailErrorStateMatcher();
  passwordMatcher = new PasswordErrorStateMatcher();
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
      email: this.emailFormControl,
      password: this.requiredFormControl,
      confirmPassword: ['']
    }, {validator: this.checkPasswords });
    this.confirmationForm = this.fb.group({
      email: this.emailFormControl,
      confirmationCode: this.requiredConfirmFormControl
    });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value;

    return pass === confirmPass ? null : { notSame: true }     
  }

  onSubmitSignup(value: any) {
    const email = value.email,
      password = value.password;
    this.auth.signUp(email, password).subscribe(
      result => {
        this.successfullySignup = true;
      },
      error => {
        if(error.code === 'UsernameExistsException') {
          this.openErrorDialog('It appears that an account associated with this email already exists.', this.createErrorTitle);
        }
        else if (error.code) {
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

}
