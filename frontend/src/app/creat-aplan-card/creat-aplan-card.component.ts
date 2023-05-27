import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attraction } from '../models/attraction';

@Component({
  selector: 'app-creat-aplan-card',
  templateUrl: './creat-aplan-card.component.html',
  styleUrls: ['./creat-aplan-card.component.css']
})
export class CreatAPlanCardComponent implements OnInit {

  @Input() attraction!: Attraction;
  @Input() isSelected: boolean | undefined;
  @Output() selectItemEvent = new EventEmitter<Attraction>();

  selectItem() {
    this.isSelected = !this.isSelected;
    this.selectItemEvent.emit(this.attraction);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
