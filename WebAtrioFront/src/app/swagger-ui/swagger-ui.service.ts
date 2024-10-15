import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn : 'root'
})
export class SwaggerUiService {
  constructor(private http : HttpClient) { }

  getConfig() : Observable<string> {
   return this.http.get('assets/config.txt', { responseType: 'text' });
  }

  getConfigValue(key: string) : Observable<string | null> {
    return this.getConfig().pipe(
      map((data : string) => {
        const line = data.split('\n').find(line => line.trim().startsWith(key));
        if (line) {
          const match = line.split('=')[1].trim();
          return match;
        }
        return null;
      })
    );
  }
}
