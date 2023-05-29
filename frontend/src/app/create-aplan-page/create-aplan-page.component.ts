import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Attraction } from '../models/attraction';
import { AttractionsResponse } from '../models/attractions-response';
import { AttractionService } from '../services/attraction.service';
import { NewTripInfo } from '../models/new-trip-info';
import { TimeInterval } from '../models/time-interval';
import { GeneratePlanPageComponent } from '../generate-plan-page/generate-plan-page.component';
import { GenerateTripPlanService } from '../services/generate-trip-plan.service';
import { SchedulePlacesRequest } from '../models/schedule-places-request';
import { SchedulePlacesResponse } from '../models/schedule-places-response';

@Component({
  selector: 'app-create-aplan-page',
  templateUrl: './create-aplan-page.component.html',
  styleUrls: ['./create-aplan-page.component.css']
})
export class CreateAPlanPageComponent implements OnInit {
  generatePlanVisible: boolean = false


  onOrderByChange($event: Event) {
    throw new Error('Method not implemented.');
  }
  onAttractionTypeChange($event: Event) {
    throw new Error('Method not implemented.');
  }
  @ViewChild('mapSearchField') mapSearchField!: ElementRef;
  @ViewChild('GoogleMap') map!: GoogleMap;
  @ViewChild('GeneratePlan') generatePlan!: GeneratePlanPageComponent;


  attractions: Attraction[][] = [];
  pageAttractions: Attraction[] = [];
  selectedAttractions: Attraction[] = [];
  nextPageToken: string = '';
  currentPage: number = 1;

  radius!: number;
  circleCenter!: google.maps.LatLng | google.maps.LatLngLiteral;
  mapCongiguration: google.maps.MapOptions = {
    center: this.circleCenter,
    zoom: 10,
    zoomControl: false,
    streetViewControl: false,
  }
  tripForm!: FormGroup;
  newTripInfo!: NewTripInfo;
  displaySelectPlaces: boolean = false;
  displayGeneratePlan: boolean = false;
  dailyProgramEnable: boolean = true;
  mapChange: boolean = false;

  constructor(private formBuilder: FormBuilder, private attractionService: AttractionService, private changeDetectorRef: ChangeDetectorRef, private tripService: GenerateTripPlanService) { }

  ngAfterViewInit() {
    const searchBox = new google.maps.places.SearchBox(this.mapSearchField.nativeElement);
    this.map.controls.push(this.mapSearchField.nativeElement);

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) {
        return;
      }

      this.displaySelectPlaces = true;

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
      this.radius = +this.newTripInfo.range * 1000;
      this.circleCenter = bounds.getCenter().toJSON();


      this.currentPage = 1
      this.attractions = [];
      this.pageAttractions = [];
      this.nextPageToken = '';

      //this.nextPageToken = '';
      const circle = new google.maps.Circle({ center: this.circleCenter, radius: this.radius });
      const circleBounds = this.getCircleBounds(this.circleCenter, this.radius);


      // Update the map's bounds to include the circle if circleBounds is not null
      if (circleBounds) {
        this.map.fitBounds(circleBounds);
      }
      else
        this.map.fitBounds(bounds);

      this.fetchAttractions(this.circleCenter.lat, this.circleCenter.lng, this.radius, this.nextPageToken);
    }

    );
    this.mapChange = true;
    this.selectedAttractions = [];
    this.changeDetectorRef.detectChanges();
  }

  getCircleBounds(circleCenter: google.maps.LatLngLiteral, radius: number): google.maps.LatLngBounds | null {
    const circle = new google.maps.Circle({ center: circleCenter, radius: radius });
    const bounds = circle.getBounds();
    return bounds ? bounds : null;
  }

  get f() {
    return this.tripForm.controls;
  }

  fetchAttractions(lat: number, lng: number, range: number, nextPageToken: string): void {
    this.attractionService.getAttractions(lat, lng, range, nextPageToken).subscribe(
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

      },
      (error: any) => {
        console.error('Error fetching attractions:', error);
      }
    );
  }

  ngOnInit() {
    this.tripForm = this.formBuilder.group({
      tripName: ['New trip', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      range: ['10', [Validators.required, Validators.min(1)]],
    });
    this.newTripInfo = new NewTripInfo();
    this.newTripInfo.range = 10;
    this.newTripInfo.tripTimeSlots = new Array(1).fill(null).map(() => this.createDefaultTimeSlots());
    this.changeDetectorRef.detectChanges();
  }

  errorMessageOnSubmit: string = '';
  displayedDate: Date = new Date();
  displayedDateString: string = this.formatDate(this.displayedDate);

  formatDate(date: Date): string {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let formattedDay = day < 10 ? 0 + day.toString() : day.toString();
    let formattedMonth = month < 10 ? 0 + month.toString() : month.toString();
    return formattedDay + "-" + formattedMonth + "-" + year;

  }

  onSubmit() {
    if (this.tripForm.valid) {
      if (this.tripForm.value['startDate'] > this.tripForm.value['endDate']) {
        this.errorMessageOnSubmit = "Start date must be before end date";
        return;
      }

      if (this.tripForm.value['range'] < 1) {
        this.errorMessageOnSubmit = "Range must be greater than 0";
        return;
      }

      if (this.tripForm.value['startDate'] < new Date()) {
        this.errorMessageOnSubmit = "Start date must be after today";
        return;
      }

      this.errorMessageOnSubmit = "";
      let date1 = new Date(this.tripForm.value['startDate']);
      let date2 = new Date(this.tripForm.value['endDate']);
      this.displayedDate = date1;
      let Difference_In_Time = date2.getTime() - date1.getTime();
      let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

      this.newTripInfo = {
        tripName: this.tripForm.value['tripName'],
        startDate: this.tripForm.value['startDate'],
        endDate: this.tripForm.value['endDate'],
        range: this.tripForm.value['range'],
        startLocation: this.circleCenter,
        tripTimeSlots: new Array(Difference_In_Days + 1).fill(null).map(() => this.createDefaultTimeSlots()),
      };
      this.dailyProgramEnable = false;
    }
    else {
      this.errorMessageOnSubmit = "Please fill all fields";
      return;
    }
    this.changeDetectorRef.detectChanges();
  }

  createDefaultTimeSlots(): TimeInterval[] {
    // Here, create your default program for a day.
    // This is just an example, modify it according to your needs.
    return [
      { start: '09:00', end: '11:00', type: 'Visiting time' },
      { start: '11:30', end: '13:30', type: 'Visiting time' },
      { start: '14:00', end: '15:00', type: 'Eating break' },
      { start: '15:30', end: '17:30', type: 'Visiting time' },
      { start: '18:00', end: '19:00', type: 'Eating break' },
    ];
  }

  startTime!: string;
  endTime!: string;
  type!: string;
  timeSlots: any[] = [];
  currentDay: number = 1;
  errorMessageTimeSlot: string = '';

  //time slot functions
  addTimeElement() {
    console.log(this.startTime);
    console.log(this.endTime);
    console.log(this.type);
    if (this.startTime == '' || this.endTime == '' || this.type == '' || this.startTime == null || this.endTime == null || this.type == null || this.startTime == undefined || this.endTime == undefined || this.type == undefined) {
      this.errorMessageTimeSlot = "Please fill all fields";
      return;
    }
    if (this.startTime >= this.endTime) {
      this.errorMessageTimeSlot = "Start time must be before end time";
      return;
    }

    // Check if new time slot interferes with any existing slot
    for (let slot of this.newTripInfo.tripTimeSlots[this.currentDay - 1]) {
      if ((this.startTime >= slot.start && this.startTime < slot.end) ||
        (this.endTime > slot.start && this.endTime <= slot.end) ||
        (this.startTime <= slot.start && this.endTime >= slot.end)) {
        this.errorMessageTimeSlot = "Time slot interferes with an existing slot";
        return;
      }
    }

    // If we reach here, the new slot does not interfere with any existing slot
    this.errorMessageTimeSlot = "";
    this.newTripInfo.tripTimeSlots[this.currentDay - 1].push({
      start: this.startTime,
      end: this.endTime,
      type: this.type,
    });

    // Sort time slots by start time
    this.newTripInfo.tripTimeSlots[this.currentDay - 1].sort((a, b) => {
      return a.start.localeCompare(b.start);
    });

    this.startTime = '';
    this.endTime = '';
    this.type = '';
    this.changeDetectorRef.detectChanges();
  }

  removeTimeSlot(index: number) {
    this.newTripInfo.tripTimeSlots[this.currentDay - 1].splice(index, 1);
  }

  //time slot select day functions
  prevDay() {
    if (this.displayedDate > new Date(this.newTripInfo.startDate)) {
      this.displayedDate.setDate(this.displayedDate.getDate() - 1);
      this.displayedDateString = this.formatDate(this.displayedDate);
      this.currentDay--;
    }
    this.changeDetectorRef.detectChanges();
  }

  nextDay() {
    if (this.displayedDate < new Date(this.newTripInfo.endDate)) {
      this.displayedDate.setDate(this.displayedDate.getDate() + 1);
      this.currentDay++;
      this.displayedDateString = this.formatDate(this.displayedDate);
      if (this.newTripInfo.tripTimeSlots[this.currentDay - 1] == undefined) {
        this.newTripInfo.tripTimeSlots[this.currentDay - 1] = [];
      }
    }
    this.changeDetectorRef.detectChanges();
  }

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
      this.fetchAttractions(this.circleCenter.lat as number, this.circleCenter.lng as number, this.newTripInfo.range, this.nextPageToken);
    }
    this.changeDetectorRef.detectChanges();
  }

  onSelectItem(attraction: Attraction) {
    if (this.selectedAttractions.includes(attraction)) {
      this.selectedAttractions.splice(this.selectedAttractions.indexOf(attraction), 1);
    }
    else {
      this.selectedAttractions.push(attraction);
    }

    console.log(this.selectedAttractions);
    this.changeDetectorRef.detectChanges();
  }

  clearTimeElements() {
    this.newTripInfo.tripTimeSlots[this.currentDay - 1] = [];
  }

  removeAttraction(index: number) {
    this.selectedAttractions.splice(index, 1);
    this.changeDetectorRef.detectChanges();
  }

  isAttractionSelected(attractionS: Attraction): boolean {
    return this.selectedAttractions.some(attraction => attraction === attractionS);
  }

  schedulePlaceResponse!: SchedulePlacesResponse[][];

  onGenerateTrip() {
    this.generatePlanVisible = !this.generatePlanVisible;
    let listPlanceId: string[] = [];
    for (let attraction of this.selectedAttractions) {
      listPlanceId.push(attraction.placeId);
    }
    let request: SchedulePlacesRequest = {
      tripInfo: this.newTripInfo,
      places: listPlanceId,
    };
    console.log(request);
    this.tripService.schedulePlaces(request).subscribe(response => {
      this.schedulePlaceResponse = response;
      for (let i = 0; i < this.schedulePlaceResponse.length; i++) {
        for (let j = 0; j < this.schedulePlaceResponse[i].length; j++) {
          const apiKey = "AIzaSyAILm8lpjdZbGCyZOgmKAW0z0sARKzKM9g&libraries=places";
          const maxWidth = 400;
          if (this.schedulePlaceResponse[i][j].place && this.schedulePlaceResponse[i][j].place.photos && this.schedulePlaceResponse[i][j].place.photos[0]) {
            this.schedulePlaceResponse[i][j].place.imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${this.schedulePlaceResponse[i][j].place.photos[0].photoReference}&key=${apiKey}`;
          }
          for (let z = 0; z < this.newTripInfo.tripTimeSlots[i].length; z++) {
            if (this.newTripInfo.tripTimeSlots[i][z].start == this.schedulePlaceResponse[i][j].timeSlot.start && this.newTripInfo.tripTimeSlots[i][z].end == this.schedulePlaceResponse[i][j].timeSlot.end) {
              this.newTripInfo.tripTimeSlots[i][z].asignedPlace = this.schedulePlaceResponse[i][j].place;
            }
          }
        }
      }
    },
      error => {
        console.error(error);  // Handle errors here
      });
  }

}
