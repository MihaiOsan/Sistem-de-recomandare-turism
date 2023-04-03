import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPeoplePageComponent } from './join-people-page.component';

describe('JoinPeoplePageComponent', () => {
  let component: JoinPeoplePageComponent;
  let fixture: ComponentFixture<JoinPeoplePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinPeoplePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinPeoplePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
