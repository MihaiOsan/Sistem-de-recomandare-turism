import { Component, Input, OnInit } from '@angular/core';
import { Place } from 'src/app/models/attractions-details';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input('attraction') attraction: Place = new Place();

  constructor() { }

  ngOnInit(): void {
  }

}
