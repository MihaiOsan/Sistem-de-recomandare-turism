import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generate-plan-page',
  templateUrl: './generate-plan-page.component.html',
  styleUrls: ['./generate-plan-page.component.css']
})
export class GeneratePlanPageComponent implements OnInit {
  mapCongiguration = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };
  constructor() { }

  ngOnInit(): void {
  }

}
