import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Job } from './job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  apiUrl: string | null = null;
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
        this.apiUrl = `http://localhost:${port}/jobs`;
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

  getJobs() : Observable<Job[]> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.get<Job[]>(url))
    );
  }

  getJobById(id : number) : Observable<Job> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.get<Job>(`${url}/${id}`))
    );
  }

  createJob(job : Job): Observable<Job> {
    const headers = { 'Content-Type': 'application/json' };
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.post<Job>(url, job, {headers}))
    );
  }

  updateJob(id : number, job : Job): Observable<Job> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.put<Job>(`${url}/${id}`, job))
    );
  }

  deleteJob(id : number) : Observable<void> {
    return this.waitForApiUrl().pipe(
      switchMap(url => this.http.delete<void>(`${url}/${id}`))
    );
  }
}
