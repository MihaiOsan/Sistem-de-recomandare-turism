import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts';
import { of } from 'rxjs';

export class ChartData{
  destination!: string;
  year!: number;
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

  city: Array<ChartData> = [
    { destination: 'Paris', year: 2019 },
    { destination: 'Paris', year: 2020 },
    { destination: 'London', year: 2020 },
    { destination: 'New York', year: 2021 },
    { destination: 'New York', year: 2021 },
    { destination: 'Los Angeles', year: 2022 },
  ];

  country: Array<ChartData> = [
    { destination: 'France', year: 2019 },
    { destination: 'France', year: 2020 },
    { destination: 'England', year: 2020 },
    { destination: 'USA', year: 2021 },
    { destination: 'USA', year: 2022 },
    { destination: 'USA', year: 2021 }
  ];

  attractionType: Array<ChartData> = [
    { destination: 'Museum', year: 2019 },
    { destination: 'Park', year: 2020 },
    { destination: 'Park', year: 2020 },
    { destination: 'Museum', year: 2021 },
    { destination: 'Restaurant', year: 2022 },
    { destination: 'Museum', year: 2021 }
  ];

  orangePalette = [
    '#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500', '#FFA07A', '#FF7F00', '#FF8C69', '#E67E22', '#FFA54F', '#FFA07A', '#FFA347', '#FFB90F', '#FFAE42', '#FF9F00', '#FF9A1E', '#F28500', '#FF7A33', '#FDBA21', '#FBA71B'
  ];


  chartConfig: any;

  ngOnInit(): void {
    this.prepareChartData(this.country, 'Country Visited');
  }

  prepareChartData(datas:Array<any>, chartTitle:string): void {
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