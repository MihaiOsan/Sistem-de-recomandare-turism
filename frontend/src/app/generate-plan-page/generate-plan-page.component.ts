import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Attraction } from '../models/attraction';
import { NewTripInfo } from '../models/new-trip-info';
import { SchedulePlacesResponse } from '../models/schedule-places-response';
import { GoogleMap } from '@angular/google-maps';
import { timeInterval } from 'rxjs';
import { TimeInterval } from '../models/time-interval';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { end } from '@popperjs/core';
import { WeatherData } from '../models/weather-data';
import { WeatherServiceService } from '../services/weather-service.service';

@Component({
  selector: 'app-generate-plan-page',
  templateUrl: './generate-plan-page.component.html',
  styleUrls: ['./generate-plan-page.component.css']
})
export class GeneratePlanPageComponent implements OnInit, OnChanges {

  @ViewChild('GoogleMap') mapp!: GoogleMap;

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: '#FFA500'  // orange
    }
  });

  mapCongiguration1 = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };

  allowDuplicates: any;

  @Input() selectedAttractions: Attraction[] = [];
  @Input() newTripInfo!: NewTripInfo;
  @Input() schedulePlacesResponse!: SchedulePlacesResponse[][];
  @Output() toggleVisibility = new EventEmitter<void>();
  @Output() childCallback: EventEmitter<Function> = new EventEmitter();
  displayedDate: Date = new Date();
  displayedDateString: string = this.formatDate(this.displayedDate);
  currentDay: any = 1;
  displayWeather: boolean = false;
  weatherData: WeatherData[] = [];

 

  constructor(private location: Location, private router: Router, private weatherService: WeatherServiceService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newTripInfo'] && changes['newTripInfo'].currentValue) {
      this.displayedDate = new Date(changes['newTripInfo'].currentValue.startDate);
      let endDate = new Date(this.newTripInfo.endDate);
      let startDate = new Date(this.newTripInfo.startDate);
      this.weatherService.getWeather(this.newTripInfo.startLocation.lat , this.newTripInfo.startLocation.lng).subscribe(data => {
        data.forEach(element => {
          if (element.date) {
            element.icon = element.icon?.replace(/\s+/g, '-').toLowerCase();
            element.icon = element.icon?.split(',')[0];
            if (element.icon?.includes('day')) {
              element.icon = element.icon?.replace('day', 'day-');
            }
            if (element.icon?.includes('night')) {
              element.icon = element.icon?.replace('night', 'night-');
            }
            if (element.icon?.includes('overcast')) {
              element.icon = element.icon?.replace('overcast', 'cloudy');
            }
            console.log(element.icon);
            let elementDate = new Date(element.date);
            let start = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            let end = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            
            if (elementDate >= new Date(start) && elementDate <= new Date(end)) {
              this.weatherData.push(element);
            }
          }
        });
      }, error => {
        // handle the error
        console.error(error);
      });
    }
  }

  ngOnInit(): void {
    this.childCallback.emit(this.calculateAndDisplayRoute.bind(this));
   
  }

  calculateAndDisplayRoute() {
    if (!this.newTripInfo) {
      return;
    }

    const locations = this.newTripInfo.tripTimeSlots[this.currentDay - 1]
      .filter((timeInterval: TimeInterval) => timeInterval.asignedPlace && timeInterval.asignedPlace.geometry)
      .map((timeInterval: TimeInterval) => {
        const location = timeInterval.asignedPlace!.geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        } as google.maps.LatLngLiteral;
      });

    if (locations.length === 0) {
      // All time slots have no assigned place, nothing to do here.
      return;
    }

    const waypoints = locations.map(location => ({ location }));

    let destination: google.maps.LatLngLiteral = this.newTripInfo.startLocation as google.maps.LatLngLiteral;
    if (waypoints.length > 0) {
      const lastWaypoint = waypoints.pop();
      if (lastWaypoint) { destination = lastWaypoint.location; }
    } else {
      destination = this.newTripInfo.startLocation as google.maps.LatLngLiteral;
    }
    console.log("waypoints", waypoints);

    this.directionsService.route(
      {
        origin: this.newTripInfo.startLocation,
        destination: destination, // Last place
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK" && response) {
          this.directionsRenderer.setDirections(response);

          // New code to center the map on the route
          const bounds = new google.maps.LatLngBounds();
          const route = response.routes[0];
          for (let i = 0; i < route.legs.length; i++) {
            const leg = route.legs[i];
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
            for (let j = 0; j < leg.steps.length; j++) {
              const step = leg.steps[j];
              bounds.extend(step.start_location);
              bounds.extend(step.end_location);
            }
          }
          if (this.mapp?.googleMap) {
            this.mapp.googleMap.fitBounds(bounds);
          }
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  ngAfterViewInit() {
    if (this.mapp?.googleMap) {
      this.directionsRenderer.setMap(this.mapp.googleMap);
      this.calculateAndDisplayRoute();
    }
  }

  getCircleBounds(circleCenter: google.maps.LatLng, radius: number): google.maps.LatLngBounds | null {
    const circle = new google.maps.Circle({ center: circleCenter, radius: radius });
    const bounds = circle.getBounds();
    return bounds ? bounds : null;
  }

  prevDay() {
    if (this.displayedDate > new Date(this.newTripInfo.startDate)) {
      this.displayedDate.setDate(this.displayedDate.getDate() - 1);
      this.displayedDateString = this.formatDate(this.displayedDate);
      this.currentDay--;
      this.calculateAndDisplayRoute();
      console.log(this.schedulePlacesResponse);
    }
  }

  nextDay() {
    console.log(this.newTripInfo.tripTimeSlots);
    if (this.displayedDate < new Date(this.newTripInfo.endDate)) {
      this.displayedDate.setDate(this.displayedDate.getDate() + 1);
      this.currentDay++;
      this.displayedDateString = this.formatDate(this.displayedDate);
      if (this.newTripInfo.tripTimeSlots[this.currentDay - 1] == undefined) {
        this.newTripInfo.tripTimeSlots[this.currentDay - 1] = [];
      }
      this.calculateAndDisplayRoute();
    }
  }

  formatDate(date: Date): string {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let formattedDay = day < 10 ? 0 + day.toString() : day.toString();
    let formattedMonth = month < 10 ? 0 + month.toString() : month.toString();
    return formattedDay + "-" + formattedMonth + "-" + year;
  }

  onCancelPlan() {
    this.toggleVisibility.emit();
    }

  onSavePlan() {
    throw new Error('Method not implemented.');
    }



}
