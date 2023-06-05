import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Attraction } from 'src/app/models/attraction';
import { AttractionsDetails, Place } from 'src/app/models/attractions-details';
import { AttractionService } from 'src/app/services/attraction.service';
import { GenerateTripPlanService } from 'src/app/services/generate-trip-plan.service';
// import Swiper core and required modules
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements AfterViewInit {
  constructor(private generateService: GenerateTripPlanService, private attractionService: AttractionService) { }
  topAttractions: Place[] = [];


  ngAfterViewInit(): void {
    this.generateService.getTopAttractions().subscribe(data => {
      this.topAttractions = data;
      //for each element in topAttractions set imageUrl
      this.topAttractions.forEach(element => {
        const apiKey = "AIzaSyAILm8lpjdZbGCyZOgmKAW0z0sARKzKM9g&libraries=places";
        const maxWidth = 400;
        if (element && element.photos && element.photos[0]) {
          element.imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${element.photos[0].photoReference}&key=${apiKey}`;
        }
      });
    });
  }

  onInit() {
  }
}
