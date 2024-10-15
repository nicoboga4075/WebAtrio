import { Component, OnInit } from '@angular/core';
import { CompanyService } from './company.service';
import { Company, serializeCompany } from './company.model';
import { NgIf, NgFor } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector : 'app-company',
  standalone : true,
  imports : [NgIf, NgFor, ReactiveFormsModule],
  templateUrl : './company.component.html',
  styleUrl : './company.component.css'
})
export class CompanyComponent implements OnInit {
  companies : Company[] = [];
  companyForm : FormGroup = new FormGroup({});
  selectedCompany : Company | null = null;
  originalInfo : Company | null = null;
  constructor(private companyService : CompanyService, private router : Router) { }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.getCompanies();
    this.initForm();
  }

  checkEmptyForm() : boolean {
    return !(Object.values(this.companyForm.controls).some(control => control.value));
  }

  checkSameForm() : boolean {
    if (this.originalInfo) {
      return !Object.keys(this.companyForm.value).some(key => serializeCompany(this.companyForm.value)[key] !== serializeCompany(this.originalInfo)[key]);
    }
    return true;
  }

  checkErrorForm(controlName : string) : boolean | undefined {
    const control = this.companyForm.get(controlName);
    return control!.invalid && (control!.touched || control!.dirty)
  }

  initForm() : void {
    this.companyForm = new FormGroup({
      name: new FormControl('', Validators.required),
    });
  }

  submitForm() : void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
    }
    else {
      if (this.selectedCompany) {
        this.updateCompany();
      } else
        this.createCompany();
    }
  }

  resetForm() : void {
    this.selectedCompany = null;
    this.companyForm.reset();
  }

  selectCompany(id : number) : void {
    const foundCompany = this.companies.find(c => c.id === id);
    if (foundCompany) {
      this.selectedCompany = foundCompany;
      this.originalInfo = { ...foundCompany }; // Store the original values for comparison
      this.companyForm.patchValue(foundCompany);
    }
  }

  getCompanies() : void {
    this.companyService.getCompanies().subscribe({
      next : (companies : Company[]) => {
        this.companies = companies;
      },
      error : (err) => {
        console.error('Error fetching companies', err);
      },
      complete : () => {
        this.resetForm();
      }
    });
  }

  getCompanyById(id: number) : void {
    this.companyService.getCompanyById(id).subscribe({
      next: (foundCompany : Company) => {
        this.selectedCompany = foundCompany;
      },
      error: (err) => {
        console.error('Error fetching companies', err);
      }
    });
  }

  createCompany() : void {
    const company = this.companyForm.value;

    this.companyService.createCompany(company).subscribe({
      next : (newCompany : Company) => {
        this.companies.push(newCompany);
      },
      error : (err) => {
        console.error('Error creating company', err);
      },
      complete : () => {
        this.resetForm();
      }
    });
  }

  updateCompany() : void {
    const index = this.companies.findIndex(c => c.id === this.selectedCompany?.id);
    const company = this.companyForm.value;

    if (index > -1) {
      const id = this.companies[index].id;

      this.companyService.updateCompany(id, company).subscribe({
        next : (updatedCompany : Company) => {
          this.companies[index] = updatedCompany;
        },
        error : (err) => {
          console.error('Error updating company', err);
        },
        complete : () => {
          this.resetForm();
        }
      });
    }
  }

  deleteCompany(id : number) : void {

    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this.companies = this.companies.filter(c => c.id !== id); // Remove the company from the list    
      },
      error: (err) => {
        console.error('Error deleting company', err);
      },
      complete: () => {
        if (this.selectedCompany && this.selectedCompany.id === id) {
          this.resetForm(); // Reset the form if the deleted company was being edited
        }
      }
    });
  }
}
