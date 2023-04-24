import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attraction } from '../models/attraction';

@Injectable({
  providedIn: 'root'
})
export class AttractionService {
  private apiUrl = 'http://localhost:8080/location/api/best-locations';

  constructor(private http: HttpClient) { }

  getAttractions(lat: number, lng: number, radius: number): Observable<Attraction[]> {
    const params = {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString()
    };
    return this.http.get<Attraction[]>(this.apiUrl, { params });
  }
}
