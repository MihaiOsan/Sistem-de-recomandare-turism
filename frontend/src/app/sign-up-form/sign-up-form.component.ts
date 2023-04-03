import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss']
})
export class SignUpFormComponent implements OnInit {

  registerForm!: FormGroup;
  loading = false;
  submitted = false;


  constructor(private formBuilder: FormBuilder, private router: Router, private authenticationService: AuthenticationService) {
    if (this.authenticationService.currentUserValue) {
      console.log(this.authenticationService.currentUserValue.enable);
      if (this.authenticationService.currentUserValue.enable==true) {
        this.router.navigate(['/home']);
      }
      else {
        console.log("else");
        this.router.navigate(['/Validation']);
      }
    }
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.registerForm.value);

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService.register(this.f['name'].value, this.f['phone'].value, this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe(
        (data) => {
          this.router.navigate(['/Validation']);
        },
        (error) => {
          this.loading = false;
        }
      );
    this.router.navigate(['/Validationn']);
  }

}
