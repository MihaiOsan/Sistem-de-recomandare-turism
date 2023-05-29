import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Attraction } from '../models/attraction';
import { NewTripInfo } from '../models/new-trip-info';
import { SchedulePlacesResponse } from '../models/schedule-places-response';

@Component({
  selector: 'app-generate-plan-page',
  templateUrl: './generate-plan-page.component.html',
  styleUrls: ['./generate-plan-page.component.css']
})
export class GeneratePlanPageComponent implements OnInit, OnChanges {
  mapCongiguration = {
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
  displayedDate: Date = new Date();
  displayedDateString: string = this.formatDate(this.displayedDate);
  currentDay: any = 1;
  @Input() schedulePlacesResponse!: SchedulePlacesResponse[][];
  
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newTripInfo'] && changes['newTripInfo'].currentValue) {
        this.displayedDate = new Date(changes['newTripInfo'].currentValue.startDate);
        this.displayedDateString = this.formatDate(this.displayedDate);
    }
}

  ngOnInit(): void {
  }

  prevDay() {
    if (this.displayedDate > new Date(this.newTripInfo.startDate)) {
      this.displayedDate.setDate(this.displayedDate.getDate() - 1);
      this.displayedDateString = this.formatDate(this.displayedDate);
      this.currentDay--;
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



}
