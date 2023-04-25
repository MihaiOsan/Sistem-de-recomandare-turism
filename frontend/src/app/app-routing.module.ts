import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountPageComponent } from './account-page/account-page.component';
import { AttractionsPageComponent } from './attractions-page/attractions-page.component';
import { CreateAPlanPageComponent } from './create-aplan-page/create-aplan-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { JoinPeoplePageComponent } from './join-people-page/join-people-page.component';
import { LogInFormComponent } from './log-in-form/log-in-form.component';
import { LoginCodeValidationComponent } from './login-code-validation/login-code-validation.component';
import { ManagePlansPageComponent } from './manage-plans-page/manage-plans-page.component';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
const routes: Routes = [];

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'LogIn', component: LogInFormComponent},
  { path: 'SignUp', component: SignUpFormComponent},
  { path: 'Validation', component: LoginCodeValidationComponent },
  { path: 'CreateAPlan', component: CreateAPlanPageComponent },
  { path: 'Attractions', component: AttractionsPageComponent },
  { path: 'ManagePlans', component: ManagePlansPageComponent },
  { path: 'JoinPeople', component: JoinPeoplePageComponent },
  { path: 'Statistics', component: StatisticsPageComponent },
  { path: 'Account', component: AccountPageComponent },
  { path: 'Attraction/:id', component: AttractionsPageComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
