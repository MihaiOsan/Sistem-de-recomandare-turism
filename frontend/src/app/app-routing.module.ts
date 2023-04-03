import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LogInFormComponent } from './log-in-form/log-in-form.component';
import { LoginCodeValidationComponent } from './login-code-validation/login-code-validation.component';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
const routes: Routes = [];

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'LogIn', component: LogInFormComponent},
  { path: 'SignUp', component: SignUpFormComponent},
  { path: 'Validation', component: LoginCodeValidationComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
