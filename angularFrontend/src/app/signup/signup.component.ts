import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from './../auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public signupForm: FormGroup;
  public confirmationForm: FormGroup;
  public successfullySignup: boolean

  hide = true;
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private fb: FormBuilder,
              private router: Router,
              private auth: AuthService) {
  }

  ngOnInit() {
    this.initForm();
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
