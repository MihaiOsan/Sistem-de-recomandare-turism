import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { Attraction } from '../models/attraction';
import { AttractionService } from '../services/attraction.service';
import { MapCenterService } from '../services/map-center-service.service';
import { AttractionsResponse } from '../models/attractions-response';
import { AuthenticationService } from '../authentication.service';


@Component({
  selector: 'app-attractions-page',
  templateUrl: './attractions-page.component.html',
  styleUrls: ['./attractions-page.component.css']
})
export class AttractionsPageComponent implements OnInit {

  display: any;
  center: google.maps.LatLngLiteral = JSON.parse(localStorage.getItem('mapCenter') || '{"lat": 45.75, "lng": 21.22}');
  range: string =  '10';

  @ViewChild('mapSearchField') mapSearchField!: ElementRef;
  @ViewChild('GoogleMap') map!: GoogleMap;
  circleCenter: google.maps.LatLngLiteral = this.center;
  radius: number = +this.range * 1000;
  attractions: Attraction[][] = [];
  currentPage: number = 1;
  nextPageToken: string = '';
  pageAttractions: Attraction[] = [];
  currentUser: any;

  filterSort: string = localStorage.getItem('filterSort') || 'prominence';
  filterType: string = localStorage.getItem('filterType') || 'tourist_attraction';

  constructor(private attractionService: AttractionService, private mapCenterService: MapCenterService, private changeDetectorRef: ChangeDetectorRef,private authentificationService: AuthenticationService) { }

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

  removeFilters() {
    this.filterSort = 'prominence';
    this.filterType = 'tourist_attraction';
    this.range = '10';
    this.applyFilters();
  }

  applyFilters() {
    this.radius = +this.range * 1000;
    const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);
    // Update the map's bounds to include the circle if circleBounds is not null
    if (circleBounds) {
      this.map.fitBounds(circleBounds);
    }
    this.currentPage = 1
    this.attractions = [];
    this.pageAttractions = [];
    this.nextPageToken = '';
    this.fetchAttractions();
    this.changeDetectorRef.detectChanges();
  }

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
      this.filterSort = 'prominence';
      this.filterType = 'tourist_attraction';
      localStorage.setItem('filterSort', this.filterSort);
      localStorage.setItem('filterType', this.filterType);
      this.setFiltersCheck();
      this.fetchAttractions();
      // Update the map's bounds to include the circle if circleBounds is not null
      if (circleBounds) {
        this.map.fitBounds(circleBounds);
      }
      else
        this.map.fitBounds(bounds);
    });
    this.changeDetectorRef.detectChanges();
  }

  prevPage() {
    if (this.currentPage == 1) return;
    this.currentPage--;
    this.pageAttractions = this.attractions[this.currentPage - 1];
    this.changeDetectorRef.detectChanges();
    this.goToTop();
  }

  nextPage() {
    console.log(this.nextPageToken);
    if (this.attractions[this.currentPage] != null) {
      this.currentPage++;
      this.pageAttractions = this.attractions[this.currentPage];
      this.goToTop();
    } else if (this.nextPageToken != '' && this.nextPageToken != null) {
      this.goToTop();
      this.currentPage++;
      this.fetchAttractions();
      this.changeDetectorRef.detectChanges();
    }
  }

  getCircleBounds(circleCenter: google.maps.LatLngLiteral, radius: number): google.maps.LatLngBounds | null {
    const circle = new google.maps.Circle({ center: circleCenter, radius: radius });
    const bounds = circle.getBounds();
    return bounds ? bounds : null;
  }

  setFiltersCheck() {
    this.filterType = localStorage.getItem('filterType') || 'turist_attraction';
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkboxes) => {
      checkboxes.checked = false;
      checkboxes.closest('.checkbox-button')?.classList.remove('checkbox-button-selected');
      if (checkboxes.value === this.filterType) {
        checkboxes.checked = true;
        checkboxes.closest('.checkbox-button')?.classList.add('checkbox-button-selected');
      }
    });

    this.filterSort = localStorage.getItem('filterSort') || 'prominence';
    const radioButtons = document.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radioButtons.forEach((radioButtons) => {
      radioButtons.checked = false;
      radioButtons.closest('.radio-button')?.classList.remove('radio-button-selected');
      if (radioButtons.value === this.filterSort) {
        radioButtons.checked = true;
        radioButtons.closest('.radio-button')?.classList.add('radio-button-selected');
      }
    });
  }

  ngOnInit(): void {
    
    const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);
    this.currentUser = this.authentificationService.currentUserValue;

    this.filterType = localStorage.getItem('filterType') || 'tourist_attraction';
    this.setFiltersCheck();

    this.fetchAttractions();

    this.changeDetectorRef.detectChanges();
   
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

    // foreach checkbox in group uncheck
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkboxes) => {
      checkboxes.checked = false;
      checkboxes.closest('.checkbox-button')?.classList.remove('checkbox-button-selected');
    });

    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        checkboxButton?.classList.add('checkbox-button-selected');
        this.filterType = checkbox.value;
        localStorage.setItem('filterType', this.filterType);
      } else {
        checkboxButton?.classList.remove('checkbox-button-selected');
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  toggleCheckboxSort(event: Event) {
    const target = event.target as HTMLElement;
    const checkboxButton = target.closest('.checkbox-button');
    const checkbox = checkboxButton?.querySelector('input[type="radio"]') as HTMLInputElement;
    // foreach checkbox in group uncheck
    const checkboxes = document.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkboxes) => {
      checkboxes.checked = false;
      checkboxes.closest('.checkbox-button')?.classList.remove('checkbox-button-selected');
    });

    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        checkboxButton?.classList.add('checkbox-button-selected');
        this.filterSort = checkbox.value;
        localStorage.setItem('filterSort', this.filterSort);
      } else {
        checkboxButton?.classList.remove('checkbox-button-selected');
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  isLoading: boolean = false;
  fetchAttractions(): void {
    this.isLoading = true;
    this.attractionService.getAttractions(this.circleCenter.lat, this.circleCenter.lng, this.radius, this.nextPageToken, this.filterType, this.filterSort).subscribe(
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
        this.changeDetectorRef.detectChanges();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching attractions:', error);
        this.isLoading = false;
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

  goToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
  
}
