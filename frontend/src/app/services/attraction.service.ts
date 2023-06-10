import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attraction } from '../models/attraction';
import { AttractionsResponse } from '../models/attractions-response';
import { AttractionsDetails, Place } from '../models/attractions-details';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AttractionService {
  private apiUrl = 'http://localhost:8080/location/api/tourist-attractions-in-radius';
  private apiUrlRecommend = 'http://localhost:8080/recommendation/api/recommended-tourist-attractions-in-radius';

  constructor(private http: HttpClient,private authentificationService: AuthenticationService) { }

  getAttractions(lat: number, lng: number, radius: number, pagetoken?:string,locationType: string = 'TOURIST_ATTRACTION', sortBy: string= 'prominence'): Observable<AttractionsResponse> {
    if (sortBy == "recommendation")
    {
      return this.getRecommendedAttractions(lat, lng, radius, pagetoken, locationType);
    }
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
      idUser: userId.toString()
    };
    return this.http.get<AttractionsResponse>(this.apiUrlRecommend, { params });
  }

  getAttractionDetails(id: string): Observable<AttractionsDetails> {
    return this.http.get<AttractionsDetails>(`http://localhost:8080/location/api/details/${id}`);
  }

  getAttractionDetailsPlace(id: string): Observable<Place> {
    return this.http.get<Place>(`http://localhost:8080/location/api/detailsWithoutWiki/${id}`);
  }
}
