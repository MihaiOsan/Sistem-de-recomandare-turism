import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAPlanPageComponent } from './create-aplan-page.component';

describe('CreateAPlanPageComponent', () => {
  let component: CreateAPlanPageComponent;
  let fixture: ComponentFixture<CreateAPlanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAPlanPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAPlanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
