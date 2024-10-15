import { Component, OnInit } from '@angular/core';
import { PersonService } from './person.service';
import { Person, serializePerson } from './person.model';
import { NgIf, NgFor } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector : 'app-person',
  standalone : true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl : './person.component.html',
  styleUrl : './person.component.css'
})
export class PersonComponent implements OnInit {

  persons : Person[] = [];
  personForm : FormGroup = new FormGroup({});
  selectedPerson : Person | null = null;
  originalInfo : Person | null = null;

  jobForm : FormGroup = new FormGroup({});
  jobsSearch : any[] = [];
  jobSearchPerformed : boolean = false;
  dateError : boolean = false;
  constructor(private personService: PersonService, private router : Router) { }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.getPersons();
    this.initForm();
  }

  checkEmptyForm() : boolean {
    return !(Object.values(this.personForm.controls).some(control => control.value)); 
  }

  checkSameForm() : boolean {
    if (this.originalInfo) {
      return !Object.keys(this.personForm.value).some(key => serializePerson(this.personForm.value)[key] !== serializePerson(this.originalInfo)[key]);
    }
    return true;
  }

  checkErrorForm(controlName: string): boolean | undefined {
    const control = this.personForm.get(controlName);
    return control!.invalid && (control!.touched || control!.dirty)
  }

  initForm() : void {
    this.personForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      birthDate: new FormControl('', Validators.required)
    });
  }

  initJobForm(): void {
    this.jobForm = new FormGroup({
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

  submitForm() : void {
    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
    }
    else {
      if (this.selectedPerson) {
        this.updatePerson();
      } else
        this.createPerson();
      } 
  }

  submitJobForm(): void {
    const job = this.jobForm.value;
    const id = this.selectedPerson?.id;
    const startDate = job?.startDate;
    const endDate = job?.endDate;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.dateError = true;
    } else {
      this.dateError = false;
      if (!this.jobForm.invalid && id) {
        this.personService.getJobsForPerson(id, startDate, endDate).subscribe({
          next : (search: any) => {
            this.jobsSearch = search.jobs;
          },
          error : (err) => {
            console.error('Error fetching jobs:', err);
          },
          complete: () => {
            this.jobSearchPerformed = true;
          }
        });
      }  
    }   
  }

  resetForm() : void {
    this.selectedPerson = null;
    this.personForm.reset();
  }

  selectPerson(id: number) : void {
    const foundPerson = this.persons.find(p => p.id === id);
    if (foundPerson) {
      this.selectedPerson = foundPerson;
      this.originalInfo = { ...foundPerson }; // Store the original values for comparison
      this.personForm.patchValue(foundPerson);
      this.initJobForm(); 
    }
  }

  getPersons() : void {
    this.personService.getPersons().subscribe({
      next : (persons : Person[]) => {
        this.persons = persons;
      },
      error : (err) => {
        console.error('Error fetching persons', err);
      },
      complete : () => {
        this.resetForm();
      }
    });
  }

  getPersonById(id : number) : void {
    this.personService.getPersonById(id).subscribe({
      next : (foundPerson : Person) => {
        this.selectedPerson = foundPerson;
      },
      error : (err) => {
        console.error('Error fetching persons', err);
      }
    });
  }

  createPerson() : void {
    const person = this.personForm.value;

    this.personService.createPerson(person).subscribe({
      next : (newPerson : Person) => {
        this.persons.push(newPerson);    
      },
      error : (err) => {
        console.error('Error creating person', err);
      },
      complete : () => {
        this.resetForm();
      }
    });
  }

  updatePerson() : void {
    const index = this.persons.findIndex(p => p.id === this.selectedPerson?.id);
    const person = this.personForm.value;

    if (index > -1) {
      const id = this.persons[index].id;

      this.personService.updatePerson(id, person).subscribe({
        next : (updatedPerson : Person) => {
          this.persons[index] = updatedPerson;
        },
        error : (err) => {
          console.error('Error updating person', err);
        },
        complete : () => {
          this.resetForm();
        }
      });
    }
  }

  deletePerson(id : number) : void {
    this.personService.deletePerson(id).subscribe({
      next : () => {
        this.persons = this.persons.filter(p => p.id !== id); // Remove the person from the list    
      },
      error : (err) => {
        console.error('Error deleting person', err);
      },
      complete : () => {
        if (this.selectedPerson && this.selectedPerson.id === id) {
          this.resetForm(); // Reset the form if the deleted person was being edited
        }
      }
    });
  }
}
