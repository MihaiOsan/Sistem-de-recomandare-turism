import { Component, Input, OnInit } from '@angular/core';
import { Attraction } from '../models/attraction';

@Component({
  selector: 'app-attraction-card',
  templateUrl: './attraction-card.component.html',
  styleUrls: ['./attraction-card.component.css']
})
export class AttractionCardComponent implements OnInit {

  @Input() attraction!: Attraction;

  constructor() { }

  ngOnInit(): void {
  }

}
