import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

type CountryResponse = {
  name: { common: string };
};

@Injectable({ providedIn: 'root' })
export class Country {
  private baseAll = 'https://restcountries.com/v3.1/all?fields=name';
  // private baseByName = 'https://restcountries.com/v3.1/name/';

  constructor(private http: HttpClient) {}

  getAllCountryNames(): Observable<string[]> {
    return this.http.get<CountryResponse[]>(this.baseAll).pipe(
      map(arr => arr.map(c => c.name.common).sort())
    );
  }

  // getCountryNames(q: string): Observable<string[]> {
  //   return this.http.get<CountryResponse[]>(`${this.baseByName}${q}?fields=name`).pipe(
  //     map(arr => arr.map(c => c.name.common).sort())
  //   );
  // }
}
