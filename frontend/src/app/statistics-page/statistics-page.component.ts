import { Component, OnInit } from '@angular/core';
import { TripPlanService } from '../services/trip-plan.service';
import { NewTripInfo } from '../models/new-trip-info';
import { TimeInterval } from '../models/time-interval';

export class ChartData {
  destination!: string;
}

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.css']
})
export class StatisticsPageComponent implements OnInit {

  changeChart(chartType: string) {
    // Update the chartConfig based on the selected chartType
    switch (chartType) {
      case 'attractions':
        // Update the chartConfig for Attractions Visited
        this.prepareChartData(this.attractionType, 'Attractions Visited');

        break;
      case 'country':
        // Update the chartConfig for Country Visited
        this.prepareChartData(this.country, 'Country Visited');
        break;
      case 'city':
        // Update the chartConfig for City Visited
        this.prepareChartData(this.city, 'City Visited');
        break;
      default:
        // Handle the default case
        break;
    }
  }

  allTripInfo?: NewTripInfo[];
  allTimeIntervals: TimeInterval[] = [];

  city: Array<ChartData> = [
  ];

  country: Array<ChartData> = [
  ];

  attractionType: Array<ChartData> = [
  ];

  orangePalette = [
    '#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500', '#FFA07A', '#FF7F00', '#FF8C69', '#E67E22', '#FFA54F', '#FFA07A', '#FFA347', '#FFB90F', '#FFAE42', '#FF9F00', '#FF9A1E', '#F28500', '#FF7A33', '#FDBA21', '#FBA71B'
  ];

  constructor(private generateTripService: TripPlanService) { }

  accepedTypes: Array<string> = [
    'museum',
    'amusement_park',
    'park',
    'aquarium',
    'art_gallery',
    'cafe',
    'shopping_mall',
    'restaurant',
    'zoo',
    'place_of_worship',
    'establishment',
  ];

  nrCity: number = 0;
  nrCountry: number = 0;
  nrAttraction: number = 0;
  nrPlans: number = 0;

  chartConfig: any;

  isLoading: boolean = true;

  ngOnInit(): void {
    this.isLoading = true;
    // pause for 10 seconds while loading the data

    this.prepareChartData(this.country, 'Country Visited');
    this.generateTripService.getSavedPlansPast().subscribe(data => {
      this.allTripInfo = data;
      this.allTripInfo.forEach(element => {
        this.nrPlans++;
        if (element.endDate) {
          let gotVisitetdCity = false;
          let gotVisitetdCountry = false;
          for (let i = 0; i < element.tripTimeSlots.length; i++) {
            for (let j = 0; j < element.tripTimeSlots[i].length; j++) {
              if (element.tripTimeSlots[i][j].asignedPlace) {
                this.nrAttraction++;
                this.allTimeIntervals.push(element.tripTimeSlots[i][j]);
                if (!gotVisitetdCity) {
                  // for all element.tripTimeSlots[i][j].asignedPlace!.address_components.length
                  for (let k = 0; k < element.tripTimeSlots[i][j].asignedPlace!.addressComponents.length; k++) {
                    if ((element.tripTimeSlots[i][j].asignedPlace!.addressComponents[k].types.includes("LOCALITY") || element.tripTimeSlots[i][j].asignedPlace!.addressComponents[k].types.includes("POSTAL_TOWN")) && !gotVisitetdCity) {
                      this.city.push({ destination: element.tripTimeSlots[i][j].asignedPlace!.addressComponents[k].longName });
                      this.nrCity++;
                      gotVisitetdCity = true;
                    }
                    if (element.tripTimeSlots[i][j].asignedPlace!.addressComponents[k].types.includes("COUNTRY") && !gotVisitetdCountry) {
                      this.nrCountry++;
                      this.country.push({ destination: element.tripTimeSlots[i][j].asignedPlace!.addressComponents[k].longName });
                      gotVisitetdCountry = true;
                    }
                  }
                }
                if (element.tripTimeSlots[i][j].asignedPlace!.types) {
                  for (let l = 0; l < element.tripTimeSlots[i][j].asignedPlace!.types.length; l++) {
                    if (this.accepedTypes.includes(element.tripTimeSlots[i][j].asignedPlace!.types[l].toLowerCase())) {
                      this.attractionType.push({ destination: element.tripTimeSlots[i][j].asignedPlace!.types[l] });
                      break;
                    }
                  }

                  for (let l = 0; l < this.accepedTypes.length; l++) {
                    if (element.tripTimeSlots[i][j].asignedPlace!.types.includes(this.accepedTypes[l].toUpperCase())) {
                      this.attractionType.push({ destination: this.accepedTypes[l].toUpperCase() });
                      break;
                    }
                  }
                }

                const apiKey = "AIzaSyAILm8lpjdZbGCyZOgmKAW0z0sARKzKM9g&libraries=places";
                const maxWidth = 400;
                if (element.tripTimeSlots[i][j].asignedPlace && element.tripTimeSlots[i][j].asignedPlace?.photos && element.tripTimeSlots[i][j].asignedPlace?.photos[0]) {
                  element.tripTimeSlots[i][j].asignedPlace!.imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${element.tripTimeSlots[i][j].asignedPlace!.photos[0].photoReference}&key=${apiKey}`;
                }
              }
            }
          }
        }
      });

      this.prepareChartData(this.country, 'Country Visited');
      this.isLoading = false;
    });

  }

  prepareChartData(datas: Array<any>, chartTitle: string): void {
    const destinationCounts = datas.reduce((acc, curr) => {
      acc[curr.destination] = (acc[curr.destination] || 0) + 1;
      return acc;
    }, {});

    const data = [];
    for (const [destination, count] of Object.entries(destinationCounts)) {
      data.push({ label: destination, value: count });
    }

    this.chartConfig = {
      type: 'pie2d',
      width: '600',
      height: '400',
      dataFormat: 'json',
      dataSource: {
        chart: {
          paletteColors: this.orangePalette.join(','),
          caption: chartTitle,
          subCaption: 'Past Vacations',
          showPercentValues: 1,
          decimals: 0,
          useDataPlotColorForLabels: 1,
          theme: 'fusion'
        },
        data: data
      }
    };
  }
}