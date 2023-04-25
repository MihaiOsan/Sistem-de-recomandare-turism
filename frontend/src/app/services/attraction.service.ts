import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attraction } from '../models/attraction';
import { AttractionsResponse } from '../models/attractions-response';

@Injectable({
  providedIn: 'root'
})
export class AttractionService {
  private apiUrl = 'http://localhost:8080/location/api/tourist-attractions-in-radius';

  constructor(private http: HttpClient) { }

  getAttractions(lat: number, lng: number, radius: number, pagetoken?:string): Observable<AttractionsResponse> {
    const params = {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      pageToken: pagetoken?.toString() || '',
    };
    return this.http.get<AttractionsResponse>(this.apiUrl, { params });
  }
}
