import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login-code-validation',
  templateUrl: './login-code-validation.component.html',
  styleUrls: ['./login-code-validation.component.css']
})
export class LoginCodeValidationComponent implements OnInit {
  email!: string;
  registerForm!: FormGroup;
  loading = false;
  submitted = false;

  
  constructor(
    private formBuilder: FormBuilder, 
    private router: Router, 
    private authenticationService: AuthenticationService
  ) {
    console.log(this.authenticationService.currentUserValue);
    if (this.authenticationService.currentUserValue && this.authenticationService.currentUserValue.enable) {
      console.log("if");
      this.router.navigate(['home']);
    }
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      codeValue: ['', Validators.required]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.email = this.authenticationService.currentUserValue.email;
    console.log(this.authenticationService.currentUserValue.enable);
    this.loading = true;
    this.authenticationService.codeVerification(this.email, this.f['codeValue'].value)
    .pipe(first())
    .subscribe(
      (data) => {
        if (data.enabled) {
          this.router.navigate(['home']);
        }
      },
      (error) => {
        this.router.navigate(['Validation']);
        this.loading = false;
      }
    );
  }

  onResetCode() {
    this.loading = true;
    this.authenticationService.resetCode(this.authenticationService.currentUserValue.email)
    .pipe(first())
    .subscribe(
      (data) => {
        if (data.enabled) {
          this.router.navigate(['home']);
        } else {
          this.router.navigate(['Validation']);
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

}
