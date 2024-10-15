import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';
import { PersonComponent } from './person/person.component';
import { CompanyComponent } from './company/company.component';
import { JobComponent } from './job/job.component';

export const routes: Routes = [
  { path : '', redirectTo : '/home', pathMatch : 'full' },
  { path : 'home', component : HomeComponent },
  { path : 'swagger-ui', component : SwaggerUiComponent },
  { path : 'persons', component : PersonComponent },
  { path : 'companies', component : CompanyComponent },
  { path : 'jobs', component : JobComponent },
  { path : '**', redirectTo : '/home' }
];
