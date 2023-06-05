import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WeatherData } from '../models/weather-data';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherServiceService {
  private apiUrl = 'http://localhost:8080'; // replace with your API URL

  constructor(private http: HttpClient) { }

  getWeather(lat: number, lng: number, start: string, end: string): Observable<WeatherData[]> {
    const url = this.apiUrl+`/location/api/weather?lat=${lat}&lng=${lng}&start=${start}&end=${end}`;
    return this.http.get<WeatherData[]>(url);
  }
}
