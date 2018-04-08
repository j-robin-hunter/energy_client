import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudSolarForecastComponent } from './cloud-solar-forecast.component';

describe('CloudSolarForecastComponent', () => {
  let component: CloudSolarForecastComponent;
  let fixture: ComponentFixture<CloudSolarForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudSolarForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudSolarForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
