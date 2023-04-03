import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSideComponent } from './signup-side.component';

describe('SignupSideComponent', () => {
  let component: SignupSideComponent;
  let fixture: ComponentFixture<SignupSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupSideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
