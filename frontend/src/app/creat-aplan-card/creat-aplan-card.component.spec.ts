import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatAPlanCardComponent } from './creat-aplan-card.component';

describe('CreatAPlanCardComponent', () => {
  let component: CreatAPlanCardComponent;
  let fixture: ComponentFixture<CreatAPlanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatAPlanCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatAPlanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
