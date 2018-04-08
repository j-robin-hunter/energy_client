import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindForecastComponent } from './wind-forecast.component';

describe('WindForecastComponent', () => {
  let component: WindForecastComponent;
  let fixture: ComponentFixture<WindForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
