import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SchedulePlacesRequest } from '../models/schedule-places-request';
import { User } from '../model';
import { NewTripInfo } from '../models/new-trip-info';
import { Place } from '../models/attractions-details';

@Injectable({
  providedIn: 'root'
})
export class TripPlanService {
  private apiUrl = 'http://localhost:8080'; // replace with your API URL

  constructor(private http: HttpClient) { }

  schedulePlaces(request: SchedulePlacesRequest): Observable<any> {
    const url = `${this.apiUrl}/trip/schedule-places`;
    return this.http.post(url, request);
  }

  savePlan(request: NewTripInfo): Observable<any> {
    let user: User = JSON.parse(localStorage.getItem('currentUser')!);
    const url = `${this.apiUrl}/trip/save-plan?userID=${user.id}`;
    return this.http.post<any>(url, request);
  }

  getSavedPlans(): Observable<NewTripInfo[]> {
    let user: User = JSON.parse(localStorage.getItem('currentUser')!);
    const url = `${this.apiUrl}/trip/get-plans?userID=${user.id}`;
    return this.http.get<NewTripInfo[]>(url);
  }

  getSavedPlansPast(): Observable<NewTripInfo[]> {
    let user: User = JSON.parse(localStorage.getItem('currentUser')!);
    const url = `${this.apiUrl}/trip/get-plans-past?userID=${user.id}`;
    return this.http.get<NewTripInfo[]>(url);
  }

  //delete plan
  deletePlan(planID: number): Observable<any> {
    const url = `${this.apiUrl}/trip/delete-plan?planID=${planID}`;
    return this.http.delete(url);
  }

  //update plan
  updatePlan(planID: number, request: NewTripInfo): Observable<any> {
    const url = `${this.apiUrl}/trip/update-plan?planID=${planID}`;
    return this.http.post(url, request);
  }

  getTopAttractions(): Observable<Place[]> {
    const url = `${this.apiUrl}/objective/top12`;
    return this.http.get<any>(url);
  }
}
