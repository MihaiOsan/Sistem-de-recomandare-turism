import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapCenterService {
  private radiusSource = new BehaviorSubject<number>(10000);
  private centerSource = new BehaviorSubject<google.maps.LatLngLiteral>({
    lat: 45.75,
    lng: 21.22,
  });

  currentCenter$ = this.centerSource.asObservable();
  currentRadius$ = this.radiusSource.asObservable();

  updateCenter(center: google.maps.LatLngLiteral, radius: number) {
    this.centerSource.next(center);
    this.radiusSource.next(radius);
  }

  
}
