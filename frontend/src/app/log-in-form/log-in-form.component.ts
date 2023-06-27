import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-log-in-form',
  templateUrl: './log-in-form.component.html',
  styleUrls: ['./log-in-form.component.scss']
})

export class LogInFormComponent implements OnInit {
  email!: string;
  logInForm!: FormGroup;
  loading = false;
  submitted = false;

  constructor(private activeRoute: ActivatedRoute, private formBuilder: FormBuilder, private authenticationService: AuthenticationService, private router: Router, private http: HttpClient) {
    if (this.authenticationService.currentUserValue) {
      if (this.authenticationService.currentUserValue.enable===true) {
        this.router.navigate(['/home']);
      }
      else {
        this.router.navigate(['/Validation']);
      }
    }
  }

  ngOnInit(): void {
    if (this.activeRoute.snapshot.queryParams['email']) {
      this.email = this.activeRoute.snapshot.queryParams['email'];
      this.authenticationService.loginSocialPass(this.email).pipe(first()).subscribe(
        () => {
          this.router.navigate(['/home']);
        }
      );
    }
    this.logInForm = this.formBuilder.group({
        email: ['', Validators.required],
        password: ['', Validators.required]
      });
    }
  

  get f() {
    return this.logInForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.logInForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService
      .login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe(
        (data) => {
          data.enabled ? this.router.navigate(['/home']) : this.router.navigate(['/Validation']);
        },
        (error) => {
          this.loading = false;
        }
      );
  }

  onFacebookLogin() {
    this.submitted = true;

    this.loading = true;
    this.authenticationService
      .loginFacebook()
  }
  onGoogleLogin() {
    this.submitted = true;

    this.loading = true;
    this.authenticationService
      .loginGoogle()
  }

}
