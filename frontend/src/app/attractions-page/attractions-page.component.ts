import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { Attraction } from '../models/attraction';
import { AttractionService } from '../services/attraction.service';


@Component({
  selector: 'app-attractions-page',
  templateUrl: './attractions-page.component.html',
  styleUrls: ['./attractions-page.component.css']
})
export class AttractionsPageComponent implements OnInit {

  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 45.75,
    lng: 21.22
  };

  @ViewChild('mapSearchField') mapSearchField!: ElementRef;
  @ViewChild('GoogleMap') map!: GoogleMap;
  range: string = '10';
  circleCenter: google.maps.LatLngLiteral = this.center;
  radius: number = +this.range * 1000;
  attractions: Attraction[] = [
];

  constructor(private attractionService: AttractionService) { }

  
  mapCongiguration = {
    zoom: 10.5,
    center: this.center,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };

  // Get the bounds of the circle
  // map initialisation

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    const searchBox = new google.maps.places.SearchBox(this.mapSearchField.nativeElement);
    this.map.controls.push(this.mapSearchField.nativeElement);

    searchBox.addListener('places_changed', () => {
      console.log('places_changed');
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) {
        return;
        console.log('No places found');
      }

      const bounds = new google.maps.LatLngBounds();
      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log('Returned place contains no geometry');
          return;
        }

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      this.radius = +this.range * 1000;
      this.circleCenter = bounds.getCenter().toJSON();
      const circle = new google.maps.Circle({ center: this.circleCenter, radius: this.radius });
      const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);

      this.fetchAttractions();

      // Update the map's bounds to include the circle if circleBounds is not null
      if (circleBounds) {
        this.map.fitBounds(circleBounds);
      }
    });
  }

  getCircleBounds(circleCenter: google.maps.LatLngLiteral, radius: number): google.maps.LatLngBounds | null {
    const circle = new google.maps.Circle({ center: circleCenter, radius: radius });
    const bounds = circle.getBounds();
    return bounds ? bounds : null;
  }

  ngOnInit(): void { 
    const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);

      this.fetchAttractions();

      // Update the map's bounds to include the circle if circleBounds is not null
      if (circleBounds) {
        this.map.fitBounds(circleBounds);
      }
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

  fetchAttractions(): void {
    this.attractionService.getAttractions(this.circleCenter.lat, this.circleCenter.lng, this.radius).subscribe(
      (data: Attraction[]) => {
        console.log('API Response:', data);
        this.attractions = data;
      },
      (error) => {
        console.error('Error fetching attractions:', error);
      }
    );
  }
}
