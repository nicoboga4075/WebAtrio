import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Person } from './person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  apiUrl : string | null = null;

  constructor(private http : HttpClient) {
    this.loadApiUrl();
  }

  private waitForApiUrl() : Observable<string> {
    return new Observable<string>(observer => {
      const interval = setInterval(() => {
        if (this.apiUrl) {
          clearInterval(interval);
          observer.next(this.apiUrl);
          observer.complete();
        }
      }, 100); // Check every 100ms until apiUrl is initialized
    });
  }

  private loadApiUrl() {
    this.getConfigValue('FLASK_RUN_PORT').subscribe(port => {
      if (port) {
        this.apiUrl = `http://localhost:${port}/persons`;
      }
    });
  }

  getConfig() : Observable<string> {
    return this.http.get('assets/config.txt', { responseType: 'text' });
  }

  getConfigValue(key : string) : Observable<string | null> {
    return this.getConfig().pipe(
      map((data: string) => {
        const line = data.split('\n').find(line => line.trim().startsWith(key));
        if (line) {
          return line.split('=')[1].trim();
        }
        return null;
      })
    );
  }

  getPersons() : Observable<Person[]> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.get<Person[]>(url))
    );
  }

  getPersonById(id : number) : Observable<Person> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.get<Person>(`${url}/${id}`))
    );
  }

  getJobsForPerson(id : number, startDate : string, endDate : string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.get<any>(`${url}/${id}/jobs`, { params }))
    );
  }

  createPerson(person : Person): Observable<Person> {
    const headers = { 'Content-Type': 'application/json' };
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.post<Person>(url, person, {headers}))
    );
  }

  updatePerson(id : number, person : Person) : Observable<Person> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.put<Person>(`${url}/${id}`, person))
    );
  }

  deletePerson(id : number) : Observable<void> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.delete<void>(`${url}/${id}`))
    );
  }
}
