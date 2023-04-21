import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-attractions-page',
  templateUrl: './attractions-page.component.html',
  styleUrls: ['./attractions-page.component.css']
})
export class AttractionsPageComponent implements OnInit {

  constructor() { }


  radiusControl = new FormControl();
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  circle!: google.maps.Circle;

  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12
  };
  zoom = 4;


  ngOnInit(): void { 

    this.initMap();
    this.initAutocomplete();
  }

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 24, lng: 12 },
      zoom: 4,
    });
  }

  initAutocomplete(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement);
    autocomplete.setFields(['geometry']);
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }

      this.setMarkerAndCircle(place.geometry.location);
    });
  }

  setMarkerAndCircle(location: google.maps.LatLng): void {
    if (this.marker) {
      this.marker.setMap(null);
    }
    if (this.circle) {
      this.circle.setMap(null);
    }

    this.marker = new google.maps.Marker({
      map: this.map,
      position: location,
    });

    this.circle = new google.maps.Circle({
      map: this.map,
      center: location,
      radius: parseFloat(this.searchControl.value) * 1000, // Convert km to meters
      fillColor: '#FFA500',
      fillOpacity: 0.3,
      strokeColor: '#FFA500',
      strokeWeight: 2,
    });

    this.map.fitBounds(this.circle.getBounds());
  }


  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  toggleCheckbox(event: Event) {
    const target = event.target as HTMLElement;
    const checkboxButton = target.closest('.checkbox-button');
    const checkbox = checkboxButton?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        checkboxButton?.classList.add('checkbox-button-selected');
      } else {
        checkboxButton?.classList.remove('checkbox-button-selected');
      }
    }
  }

}
