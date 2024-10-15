import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PersonComponent } from './person/person.component';
import { CompanyComponent } from './company/company.component';
import { JobComponent } from './job/job.component';

@NgModule({
  declarations : [
    AppComponent,
    HomeComponent,
    PersonComponent,
    CompanyComponent,
    JobComponent
  ],
  imports : [
    BrowserModule,
    NgModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
