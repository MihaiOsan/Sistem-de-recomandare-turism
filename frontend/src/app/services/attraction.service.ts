import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attraction } from '../models/attraction';
import { AttractionsResponse } from '../models/attractions-response';
import { AttractionsDetails } from '../models/attractions-details';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AttractionService {
  private apiUrl = 'http://localhost:8080/location/api/tourist-attractions-in-radius';
  private apiUrlRecommend = 'http://localhost:8080/location/api/tourist-attractions-in-radius-recommend';

  constructor(private http: HttpClient,private authentificationService: AuthenticationService) { }

  getAttractions(lat: number, lng: number, radius: number, pagetoken?:string,locationType: string = 'TOURIST_ATTRACTION', sortBy: string= 'prominence'): Observable<AttractionsResponse> {
    const params = {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      pageToken: pagetoken?.toString() || '',
      locationType: locationType.toUpperCase(),
      sortBy: sortBy
    };
    return this.http.get<AttractionsResponse>(this.apiUrl, { params });
  }

  getRecommendedAttractions(lat: number, lng: number, radius: number, pagetoken?:string,locationType: string = 'TOURIST_ATTRACTION', userId: number = this.authentificationService.currentUserValue.id): Observable<AttractionsResponse> {
    const params = {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      pageToken: pagetoken?.toString() || '',
      locationType: locationType,
      userId: userId.toString()
    };
    return this.http.get<AttractionsResponse>(this.apiUrl, { params });
  }

  getAttractionDetails(id: string): Observable<AttractionsDetails> {
    return this.http.get<AttractionsDetails>(`http://localhost:8080/location/api/details/${id}`);
  }
}
