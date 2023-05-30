import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-plans-page',
  templateUrl: './manage-plans-page.component.html',
  styleUrls: ['./manage-plans-page.component.css']
})
export class ManagePlansPageComponent implements OnInit {

  constructor() { }

  mapCongiguration = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };

  ngOnInit(): void {
  }

}
