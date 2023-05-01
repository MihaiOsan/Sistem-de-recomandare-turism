import { Component, Input, OnInit } from '@angular/core';
import { Attraction } from '../models/attraction';

@Component({
  selector: 'app-creat-aplan-card',
  templateUrl: './creat-aplan-card.component.html',
  styleUrls: ['./creat-aplan-card.component.css']
})
export class CreatAPlanCardComponent implements OnInit {

  @Input() attraction!: Attraction;
  

  constructor() { }

  ngOnInit(): void {
  }

}
