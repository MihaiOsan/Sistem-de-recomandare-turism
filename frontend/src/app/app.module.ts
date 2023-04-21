import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LogInFormComponent } from './log-in-form/log-in-form.component';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AttractionsPageComponent } from './attractions-page/attractions-page.component';
import { CreateAPlanPageComponent } from './create-aplan-page/create-aplan-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';


import { CoolSocialLoginButtonsModule } from '@angular-cool/social-login-buttons';
import { LoginCodeValidationComponent } from './login-code-validation/login-code-validation.component';
import { SignupSideComponent } from './signup-side/signup-side.component';
import { AppDropdownDirectiveDirective } from './app-dropdown-directive.directive';
import { ManagePlansPageComponent } from './manage-plans-page/manage-plans-page.component';
import { JoinPeoplePageComponent } from './join-people-page/join-people-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { AccountPageComponent } from './account-page/account-page.component';
import { CardComponent } from './home-page/card/card.component';
import { SliderComponent } from './home-page/slider/slider.component';
import { SwiperModule } from 'swiper/angular';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { AttractionCardComponent } from './attraction-card/attraction-card.component'

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LogInFormComponent,
    SignUpFormComponent,
    HomePageComponent,
    AttractionsPageComponent,
    CreateAPlanPageComponent,
    LoginCodeValidationComponent,
    SignupSideComponent,
    AppDropdownDirectiveDirective,
    ManagePlansPageComponent,
    JoinPeoplePageComponent,
    StatisticsPageComponent,
    AccountPageComponent,
    CardComponent,
    SliderComponent,
    AttractionCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoolSocialLoginButtonsModule,
    SwiperModule,
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
