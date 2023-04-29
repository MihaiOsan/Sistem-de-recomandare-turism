import { Component, OnInit } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-create-aplan-page',
  templateUrl: './create-aplan-page.component.html',
  styleUrls: ['./create-aplan-page.component.css']
})
export class CreateAPlanPageComponent implements OnInit {
radius!: number;
circleCenter!: google.maps.LatLng|google.maps.LatLngLiteral;
mapCongiguration: google.maps.MapOptions = {
  center: this.circleCenter,
  zoom: 10,
  zoomControl:false,
  streetViewControl:false,
}

  constructor() { }

  ngOnInit(): void {
  }

}
