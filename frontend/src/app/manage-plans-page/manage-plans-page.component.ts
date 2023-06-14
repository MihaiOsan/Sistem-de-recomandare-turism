import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { WeatherData } from '../models/weather-data';
import { GoogleMap } from '@angular/google-maps';
import { NewTripInfo } from '../models/new-trip-info';
import { WeatherServiceService } from '../services/weather-service.service';
import { TripPlanService } from '../services/trip-plan.service';
import { DatePipe } from '@angular/common';
import { TimeInterval } from '../models/time-interval';
import { Attraction } from '../models/attraction';
import { AttractionService } from '../services/attraction.service';
import { AttractionsResponse } from '../models/attractions-response';
import { finalize } from 'rxjs';
import { Place } from '../models/attractions-details';

@Component({
  selector: 'app-manage-plans-page',
  templateUrl: './manage-plans-page.component.html',
  styleUrls: ['./manage-plans-page.component.css']
})

export class ManagePlansPageComponent implements OnInit {
  editTripInfo!: NewTripInfo;
  onSlotClick(i: number) {
    if (this.selectedForEdit != -1) {
      this.selectedSlotIndex = this.selectedSlotIndex == i ? -1 : i;
      this.tripSlotSelect();
    }
  }

  tripSlotSelect() {
    if (this.selectedAttraction != undefined && this.selectedSlotIndex >= 0) {
      this.attractionService.getAttractionDetailsPlace(this.selectedAttraction.placeId)
        .pipe(
          finalize(() => {
            this.selectedAttraction = undefined;
            this.selectedSlotIndex = -1;
          })
        )
        .subscribe(
          (data: Place) => {
            console.log(data);
            if (this.selectedAttraction) {
              data.imageUrl = this.selectedAttraction.imageUrl;
              //make sure that the place conatains a type that matches the slot type
              //convert the type of the slot as follow> "eating break" -> "restaurant" or "cafe", "visiting time "
              if (this.editTripInfo.tripTimeSlots[this.currentDay - 1][this.selectedSlotIndex].type == "Eating break" && (data.types.includes("RESTAURANT") || data.types.includes("CAFE")) ||
                (this.editTripInfo.tripTimeSlots[this.currentDay - 1][this.selectedSlotIndex].type == "Visiting time" && (!data.types.includes("RESTAURANT") && !data.types.includes("CAFE") && !data.types.includes("SHOPPING_MALL")) ||
                  (this.editTripInfo.tripTimeSlots[this.currentDay - 1][this.selectedSlotIndex].type == "Shopping spree" && data.types.includes("SHOPPING_MALL")))) {
                this.editTripInfo.tripTimeSlots[this.currentDay - 1][this.selectedSlotIndex].asignedPlace = data;
                this.calculateAndDisplayRoute();
              }
              this.changeDetectorRef.detectChanges();
            }
          }
        );
    }
  }

  selectedForEdit: number = -1;
  nextPageToken: string | undefined;
  filterType: string | undefined;
  filterSort: string | undefined;
  attractions: Attraction[][] = [];
  pageAttractions: Attraction[] = [];
  selectedAttraction: Attraction | undefined;

  fetchAttractions(lat: number, lng: number, radius: number): void {
    this.isLoadingSelection = true;
    this.attractionService.getAttractions(lat, lng, radius, this.nextPageToken, this.filterType, this.filterSort).subscribe(
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
        this.isLoadingSelection = false;
      },
      (error) => {
        console.error('Error fetching attractions:', error);
        this.isLoadingSelection = false;
      }
    );
  }


  onSelectItem(attraction: Attraction) {
    if (this.selectedAttraction === attraction) {
      this.selectedAttraction = undefined;
    }
    else {
      this.selectedAttraction = attraction;
      this.tripSlotSelect();
    }
    this.changeDetectorRef.detectChanges();
  }

  saveEditTripSlot(i: number) {
    this.planService.updatePlan(this.editTripInfo.planID!, this.editTripInfo).subscribe();
    this.allTripInfo.forEach(trip => {
      if (trip.planID == this.editTripInfo.planID) {
        trip = this.editTripInfo;
      }
    }
    );
    this.upcomingTrips.forEach(trip => {
      if (trip.planID == this.editTripInfo.planID) {
        trip = this.editTripInfo;
      }
    });
    this.pastTrips.forEach(trip => {
      if (trip.planID == this.editTripInfo.planID) {
        trip = this.editTripInfo;
      }
    }
    );
    this.displayedTrips[i] = this.editTripInfo;
    this.selectedTripInfo = this.editTripInfo;
    this.attractions = [];
    this.nextPageToken = '';
    this.currentPage = 1;
    this.pageAttractions = [];
    this.filterSort = 'prominence';
    this.filterType = 'tourist_attraction';
    this.selectedForEdit = -1;
    this.selectedTripIndex = -1;
  }

  cancelEditTripSlot(i: number) {
    this.selectedTripInfo = this.displayedTrips[i];
    this.selectedForEdit = -1;
  }

  editTripSlot(i: number) {
    this.selectedForEdit = i;
    this.selectedTripIndex = i;
    this.editTripInfo = JSON.parse(JSON.stringify(this.displayedTrips[i]));
    this.selectedTripInfo = this.editTripInfo;
    this.attractions = [];
    this.nextPageToken = '';
    this.currentPage = 1;
    this.pageAttractions = [];
    this.filterSort = 'prominence';
    this.filterType = 'tourist_attraction';
    this.fetchAttractions(this.editTripInfo.startLocation.lat, this.editTripInfo.startLocation.lng, this.selectedTripInfo.range * 1000);
  }

  isLoadingSelection: any;


  prevPage() {
    if (this.currentPage == 1) return;
    this.currentPage--;
    this.pageAttractions = this.attractions[this.currentPage - 1];
    this.changeDetectorRef.detectChanges();
  }

  nextPage() {
    console.log(this.nextPageToken);
    if (this.attractions[this.currentPage] != null) {
      this.currentPage++;
      this.pageAttractions = this.attractions[this.currentPage];
    } else if (this.nextPageToken != '' && this.nextPageToken != null) {
      this.currentPage++;
      this.fetchAttractions(this.selectedTripInfo.startLocation.lat, this.selectedTripInfo.startLocation.lng, this.selectedTripInfo.range * 1000);
    }
    this.changeDetectorRef.detectChanges();
  }

  currentPage: number = 1;

  isAttractionSelected(attractionS: Attraction): boolean {
    return this.selectedAttraction === attractionS;
  }

  onOrderByChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue !== null) {
      this.filterSort = selectedValue;
    }
    this.currentPage = 1
    this.attractions = [];
    this.pageAttractions = [];
    this.nextPageToken = '';
    this.fetchAttractions(this.selectedTripInfo.startLocation.lat, this.selectedTripInfo.startLocation.lng, this.selectedTripInfo.range * 1000);
    this.changeDetectorRef.detectChanges();
  }

  onAttractionTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue !== null) {
      this.filterType = selectedValue;
    }
    this.currentPage = 1
    this.attractions = [];
    this.pageAttractions = [];
    this.nextPageToken = '';
    this.fetchAttractions(this.selectedTripInfo.startLocation.lat, this.selectedTripInfo.startLocation.lng, this.selectedTripInfo.range * 1000);
    this.changeDetectorRef.detectChanges();
  }
  slectedTripIndex: any;

  selectedSlotIndex: any;

  selectedforDelete: any = -1;


  @ViewChild('GoogleMap') mapp!: GoogleMap;

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: '#FFA500'  // orange
    }
  });

  dateToday: Date = new Date((new Date()).setHours(0, 0, 0, 0));
  displayedDate: Date = new Date();
  displayedDateString: string = this.formatDate(this.displayedDate);
  displayWeather: boolean = false;
  weatherData: WeatherData[] = [];  // WeatherData is a model class
  currentDay: number = 1;

  selectedTripInfo!: NewTripInfo;
  allTripInfo: NewTripInfo[] = [];
  pastTrips: NewTripInfo[] = [];
  upcomingTrips: NewTripInfo[] = [];
  displayedTrips: NewTripInfo[] = [];

  selectedTripIndex: any = 0;

  ngAfterViewInit() {
    if (this.mapp?.googleMap) {
      this.directionsRenderer.setMap(this.mapp.googleMap);
      this.calculateAndDisplayRoute();
    }
  }

  constructor(private weatherService: WeatherServiceService, private changeDetectorRef: ChangeDetectorRef, private generateTripService: TripPlanService, private datePipe: DatePipe, private attractionService: AttractionService, private planService: TripPlanService) { }

  mapCongiguration = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };

  isLoading: boolean = false;

  getPlanDate(date: Date) {
    return new Date(date);
  }

  ngOnInit(): void {
    this.isLoading = true;
    console.log(this.dateToday);
    this.generateTripService.getSavedPlans().subscribe(data => {
      this.allTripInfo = data;
      this.allTripInfo.forEach(element => {
        if (element.endDate) {
          let endDate = new Date(element.endDate);
          let today = new Date();
          today.setHours(0, 0, 0, 0);
          if (endDate < today) {
            this.pastTrips.push(element);
          } else {
            this.upcomingTrips.push(element);
          }
          for (let i = 0; i < element.tripTimeSlots.length; i++) {
            for (let j = 0; j < element.tripTimeSlots[i].length; j++) {
              const apiKey = "AIzaSyAILm8lpjdZbGCyZOgmKAW0z0sARKzKM9g&libraries=places";
              const maxWidth = 400;
              if (element.tripTimeSlots[i][j].asignedPlace && element.tripTimeSlots[i][j].asignedPlace?.photos && element.tripTimeSlots[i][j].asignedPlace?.photos[0]) {
                element.tripTimeSlots[i][j].asignedPlace!.imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${element.tripTimeSlots[i][j].asignedPlace!.photos[0].photoReference}&key=${apiKey}`;
              }
            }
          }
        }
      });
      this.displayedTrips = this.upcomingTrips;
      if (this.allTripInfo.length > 0) {
        this.selectedTripInfo = this.upcomingTrips[0];
        this.displayedDate = new Date(this.selectedTripInfo.startDate);
        this.displayedDateString = this.formatDate(this.displayedDate);
        this.getWeather();
      }

      this.changeDetectorRef.detectChanges();
      this.calculateAndDisplayRoute();
      this.isLoading = false;
    });
  }

  getWeather() {
    let endDate = new Date(this.selectedTripInfo.endDate);
    let startDate = new Date(this.selectedTripInfo.startDate);
    this.weatherData = [];
    if (endDate != null && startDate != null) {
      //add a day to the end date to include the last day
      endDate.setDate(endDate.getDate() + 1);
      let transformedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
      let transformedEndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');

      if (transformedEndDate && transformedStartDate) {
        this.weatherService.getWeather(this.selectedTripInfo.startLocation.lat, this.selectedTripInfo.startLocation.lng, transformedStartDate, transformedEndDate).subscribe(data => {
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
              let elementDate = new Date(element.date);
              let start = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
              let end = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
              end = new Date(new Date(end).getTime() + 86400000).toISOString().split('T')[0];


              if (elementDate >= new Date(start) && elementDate < new Date(end)) {
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
  }

  calculateAndDisplayRoute() {
    if (!this.selectedTripInfo) {
      return;
    }

    //move map to start location
    this.mapp.panTo(this.selectedTripInfo.startLocation);
    //clear previous route
    this.directionsRenderer.setDirections({ routes: [] });

    const locations = this.selectedTripInfo.tripTimeSlots[this.currentDay - 1]
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

    let destination: google.maps.LatLngLiteral = this.selectedTripInfo.startLocation as google.maps.LatLngLiteral;
    if (waypoints.length > 0) {
      const lastWaypoint = waypoints.pop();
      if (lastWaypoint) { destination = lastWaypoint.location; }
    } else {
      destination = this.selectedTripInfo.startLocation as google.maps.LatLngLiteral;
    }

    this.directionsService.route(
      {
        origin: this.selectedTripInfo.startLocation,
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

  prevDay() {
    if (this.displayedDate > new Date(this.selectedTripInfo.startDate)) {
      console.log(this.weatherData)
      this.displayedDate.setDate(this.displayedDate.getDate() - 1);
      this.displayedDateString = this.formatDate(this.displayedDate);
      this.currentDay--;
      this.calculateAndDisplayRoute();
    }
  }

  nextDay() {
    if (this.displayedDate < new Date(this.selectedTripInfo.endDate)) {
      this.displayedDate.setDate(this.displayedDate.getDate() + 1);
      this.currentDay++;
      this.displayedDateString = this.formatDate(this.displayedDate);
      if (this.selectedTripInfo.tripTimeSlots[this.currentDay - 1] == undefined) {
        this.selectedTripInfo.tripTimeSlots[this.currentDay - 1] = [];
      }
      this.calculateAndDisplayRoute();
    }
  }

  formatDate(date: Date): string {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let formattedDay = day < 10 ? '0' + day.toString() : day.toString();
    let formattedMonth = month < 10 ? '0' + month.toString() : month.toString();
    return formattedDay + "-" + formattedMonth + "-" + year;
  }

  transformDate(date: any): string {
    const transformedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    return transformedDate ? transformedDate : 'Invalid date';
  }

  removeTripSlot(i: number) {
    this.selectedforDelete = i;
    this.openModal();
  }

  onDeisplayTripInfo(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log(selectedValue);
    if (selectedValue !== null) {
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedValue === 'all') {
        this.displayedTrips = this.allTripInfo;
      }
      else if (selectedValue === 'past') {
        this.displayedTrips = this.pastTrips;
      }
      if (selectedValue === 'upcoming') {
        this.displayedTrips = this.upcomingTrips;
      }
      this.selectedTripInfo = this.displayedTrips[0];
      this.selectedTripIndex = 0;
      this.currentDay = 1;
      this.displayedDate = new Date(this.selectedTripInfo.startDate);
      this.displayedDateString = this.formatDate(this.displayedDate);
      this.calculateAndDisplayRoute();
      this.getWeather();
      this.changeDetectorRef.detectChanges();
    }
  }


  onTripInfoClick(i: number) {
    this.cancelEditTripSlot(i);
    this.selectedTripInfo = this.displayedTrips[i];
    this.selectedTripIndex = i;
    this.currentDay = 1;
    this.displayedDate = new Date(this.selectedTripInfo.startDate);
    this.displayedDateString = this.formatDate(this.displayedDate);
    this.getWeather();
    this.calculateAndDisplayRoute();
    this.changeDetectorRef.detectChanges();
  }


  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.selectedforDelete = -1;
    this.showModal = false;
  }

  confirmModal() {
    this.showModal = false;
    let tripToDelete = this.displayedTrips[this.selectedforDelete];

    if (tripToDelete.planID != null) {
      this.generateTripService.deletePlan(tripToDelete.planID).subscribe();
    }

    this.displayedTrips.splice(this.selectedforDelete, 1);

    let indexInAll = this.allTripInfo.indexOf(tripToDelete);
    if (indexInAll > -1) {
      this.allTripInfo.splice(indexInAll, 1);
    }

    let indexInPast = this.pastTrips.indexOf(tripToDelete);
    if (indexInPast > -1) {
      this.pastTrips.splice(indexInPast, 1);
    }

    let indexInUpcoming = this.upcomingTrips.indexOf(tripToDelete);
    if (indexInUpcoming > -1) {
      this.upcomingTrips.splice(indexInUpcoming, 1);
    }

    // Reset deletion index.
    if (this.selectedforDelete == this.selectedTripIndex) {
      this.selectedTripIndex = 0;
      this.selectedTripInfo = this.displayedTrips[0];
      this.currentDay = 1;
      this.displayedDate = new Date(this.selectedTripInfo.startDate);
      this.getWeather();
      this.calculateAndDisplayRoute();
    }

    this.selectedforDelete = -1;
  }

}
