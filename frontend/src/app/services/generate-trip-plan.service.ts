import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SchedulePlacesRequest } from '../models/schedule-places-request';

@Injectable({
  providedIn: 'root'
})
export class GenerateTripPlanService {
  private apiUrl = 'http://localhost:8080'; // replace with your API URL

  constructor(private http: HttpClient) { }

  schedulePlaces(request: SchedulePlacesRequest): Observable<any> {
    const url = `${this.apiUrl}/trip/schedule-places`;
    return this.http.post(url, request);
  }
}
