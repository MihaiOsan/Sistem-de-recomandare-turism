import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePlanPageComponent } from './generate-plan-page.component';

describe('GeneratePlanPageComponent', () => {
  let component: GeneratePlanPageComponent;
  let fixture: ComponentFixture<GeneratePlanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratePlanPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratePlanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
