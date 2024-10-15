import { Component, OnInit } from '@angular/core';
import { JobService } from './job.service';
import { Job, serializeJob } from './job.model';
import { NgIf, NgFor } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../company/company.service';
import { PersonService } from '../person/person.service';
import { Person } from '../person/person.model';
import { Company } from '../company/company.model';
import { Router } from '@angular/router';

@Component({
  selector : 'app-job',
  standalone : true,
  imports : [NgIf, NgFor, ReactiveFormsModule],
  templateUrl : './job.component.html',
  styleUrl : './job.component.css'
})
export class JobComponent implements OnInit {

  jobs: Job[] = [];
  companies : Company[] = [];
  persons : Person[] = [];
  jobForm : FormGroup = new FormGroup({});
  selectedJob : Job | null = null;
  originalInfo : Job | null = null;
  constructor(private jobService : JobService, private companyService : CompanyService, private personService : PersonService, private router : Router ) { }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.getJobs();
    this.getCompanies();
    this.getPersons();
    this.initForm();
  }

  checkEmptyForm() : boolean {
    return !(Object.values(this.jobForm.controls).some(control => control.value));
  }

  checkSameForm() : boolean {
    if (this.originalInfo) {
      return !Object.keys(this.jobForm.value).some(key => serializeJob(this.jobForm.value)[key] !== serializeJob(this.originalInfo)[key]);
    }
    return true;
  }

  checkErrorForm(controlName : string) : boolean | undefined {
    const control = this.jobForm.get(controlName);
    return control!.invalid && (control!.touched || control!.dirty)
  }

  initForm() : void {
    this.jobForm = new FormGroup({
      position : new FormControl('', Validators.required),
      startDate : new FormControl('', Validators.required),
      endDate : new FormControl(''),
      companyId : new FormControl('', Validators.required),
      personId: new FormControl('', Validators.required)
    });
  }

  submitForm() : void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
    }
    else {
      if (this.selectedJob) {
        this.updateJob();
      } else
        this.createJob();
    }
  }

  resetForm() : void {
    this.selectedJob = null;
    this.jobForm.reset();
  }

  selectJob(id : number) : void {
    const foundJob = this.jobs.find(j => j.id === id);
    if (foundJob) {
      this.selectedJob = foundJob;
      this.originalInfo = { ...foundJob }; // Store the original values for comparison
      this.jobForm.patchValue(foundJob);
    }
  }

  getJobs() : void {
    this.jobService.getJobs().subscribe({
      next: (jobs : Job[]) => {
        this.jobs = jobs;
      },
      error: (err) => {
        console.error('Error fetching jobs', err);
      },
      complete: () => {
        this.resetForm();
      }
    });
  }

  getJobById(id : number) : void {
    this.jobService.getJobById(id).subscribe({
      next: (foundJob: Job) => {
        this.selectedJob = foundJob;
      },
      error: (err) => {
        console.error('Error fetching jobs', err);
      }
    });
  }

  getCompanies() {
    this.companyService.getCompanies().subscribe((companies) => {
      this.companies = companies;
    });
  }

  getCompanyName(companyId : number): string {
    return this.companies.find(company => company.id === companyId)?.name || "";
  }

  getPersons() {
    this.personService.getPersons().subscribe((persons) => {
      this.persons = persons;
    });
  }

  getPersonName(personId : number): string {
    return this.persons.find(person => person.id === personId)?.fullName || "";
  }

  createJob() : void {
    const job = this.jobForm.value;

    this.jobService.createJob(job).subscribe({
      next: (newJob : Job) => {
        this.jobs.push(newJob);
      },
      error: (err) => {
        console.error('Error creating job', err);
      },
      complete: () => {
        this.resetForm();
      }
    });
  }

  updateJob() : void {
    const index = this.jobs.findIndex(j => j.id === this.selectedJob?.id);
    const job = this.jobForm.value;

    if (index > -1) {
      const id = this.jobs[index].id;

      this.jobService.updateJob(id, job).subscribe({
        next: (updatedJob : Job) => {
          this.jobs[index] = updatedJob;
        },
        error: (err) => {
          console.error('Error updating job', err);
        },
        complete: () => {
          this.resetForm();
        }
      });
    }
  }

  deleteJob(id : number) : void {

    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== id); // Remove the job from the list    
      },
      error: (err) => {
        console.error('Error deleting job', err);
      },
      complete: () => {
        if (this.selectedJob && this.selectedJob.id === id) {
          this.resetForm(); // Reset the form if the deleted job was being edited
        }
      }
    });
  }
}
