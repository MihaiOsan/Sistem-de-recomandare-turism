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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LogInFormComponent,
    SignUpFormComponent,
    HomePageComponent,
    AttractionsPageComponent,
    CreateAPlanPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
