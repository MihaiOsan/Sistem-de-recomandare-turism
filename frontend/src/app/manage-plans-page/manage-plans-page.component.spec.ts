import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePlansPageComponent } from './manage-plans-page.component';

describe('ManagePlansPageComponent', () => {
  let component: ManagePlansPageComponent;
  let fixture: ComponentFixture<ManagePlansPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagePlansPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePlansPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
