import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { Attraction } from '../models/attraction';
import { AttractionService } from '../services/attraction.service';
import { MapCenterService } from '../services/map-center-service.service';
import { AttractionsResponse } from '../models/attractions-response';


@Component({
  selector: 'app-attractions-page',
  templateUrl: './attractions-page.component.html',
  styleUrls: ['./attractions-page.component.css']
})
export class AttractionsPageComponent implements OnInit {
toggleRating($event: MouseEvent) {
throw new Error('Method not implemented.');
}
removeFilters() {
}
applyFilters() {
}


  display: any;
  center: google.maps.LatLngLiteral = JSON.parse(localStorage.getItem('mapCenter') || '{"lat": 45.75, "lng": 21.22}');
  range: string = JSON.parse(localStorage.getItem('mapRange') || '10');

  @ViewChild('mapSearchField') mapSearchField!: ElementRef;
  @ViewChild('GoogleMap') map!: GoogleMap;
  circleCenter: google.maps.LatLngLiteral = this.center;
  radius: number = +this.range * 1000;
  attractions: Attraction[][] = [];
  currentPage: number = 1;
  nextPageToken: string = '';
  pageAttractions: Attraction[] = [];

  constructor(private attractionService: AttractionService, private mapCenterService: MapCenterService) { }


  mapCongiguration = {
    center: this.center,
    zoom: 10,
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
      localStorage.setItem('mapCenter', JSON.stringify(this.circleCenter));
      localStorage.setItem('mapRange', JSON.stringify(this.range));
      const circle = new google.maps.Circle({ center: this.circleCenter, radius: this.radius });
      const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);

      this.currentPage = 1
      this.attractions = [];
      this.pageAttractions = [];
      this.nextPageToken = '';

      //this.nextPageToken = '';
      this.fetchAttractions();

      // Update the map's bounds to include the circle if circleBounds is not null
      if (circleBounds) {
        this.map.fitBounds(circleBounds);
      }
      else
        this.map.fitBounds(bounds);
    });
  }

  prevPage() {
    if (this.currentPage == 1) return;
    this.currentPage--;
    this.pageAttractions = this.attractions[this.currentPage - 1];

  }

  nextPage() {
    console.log(this.nextPageToken);
    if (this.attractions[this.currentPage] != null) {
      this.currentPage++;
      this.pageAttractions = this.attractions[this.currentPage];
    } else if (this.nextPageToken != '' && this.nextPageToken != null) {
      this.currentPage++;
      this.fetchAttractions();
    }
  }

  getCircleBounds(circleCenter: google.maps.LatLngLiteral, radius: number): google.maps.LatLngBounds | null {
    const circle = new google.maps.Circle({ center: circleCenter, radius: radius });
    const bounds = circle.getBounds();
    return bounds ? bounds : null;
  }

  ngOnInit(): void {
    
    const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);

    this.fetchAttractions();
   
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
    this.attractionService.getAttractions(this.circleCenter.lat, this.circleCenter.lng, this.radius, this.nextPageToken).subscribe(
      (data: AttractionsResponse) => {
        this.attractions.push(data.places);
        this.nextPageToken = data.pageToken;
        for (let i = 0; i < this.attractions[this.currentPage - 1].length; i++) {
          const apiKey = "AIzaSyAILm8lpjdZbGCyZOgmKAW0z0sARKzKM9g&libraries=places";
          const maxWidth = 400;
          if (this.attractions[this.currentPage - 1][i] && this.attractions[this.currentPage - 1][i].photos && this.attractions[this.currentPage - 1][i].photos[0]) {
            this.attractions[this.currentPage - 1][i].imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${this.attractions[this.currentPage - 1][i].photos[0].photoReference}&key=${apiKey}`;
          }
        }
        this.pageAttractions = this.attractions[this.currentPage - 1];
      },
      (error) => {
        console.error('Error fetching attractions:', error);
      }
    );
  }

  onMapReady(map: GoogleMap) {
    this.map = map;
  
    const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);
  
    this.fetchAttractions();
  
    // Update the map's bounds to include the circle if circleBounds is not null
    if (circleBounds) {
      this.map.fitBounds(circleBounds);
    }
  }
  
}
