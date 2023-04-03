import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCodeValidationComponent } from './login-code-validation.component';

describe('LoginCodeValidationComponent', () => {
  let component: LoginCodeValidationComponent;
  let fixture: ComponentFixture<LoginCodeValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginCodeValidationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCodeValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
