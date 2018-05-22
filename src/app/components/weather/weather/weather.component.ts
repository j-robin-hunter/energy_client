import { Component, OnInit, OnDestroy, Input} from '@angular/core';
import { WeatherService, IWeather, IWhere, IValue } from '../../../services/weather.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  weatherData: IWeather;
  /**
    icon: '0999'
    temp: IVlaue = {value: 0, unit: ''},
    description: 'Unknown at this time',
    speed: IValue = {value: 0, unit: ''},
    direction: '';
  **/
  subscription: Subscription;
  whenIndex: number = 0;

  constructor(private weatherService: WeatherService) {
    this.subscription = weatherService.weatherSource$.subscribe(weather => {
      if (this.whenIndex >= 0 && this.whenIndex < weather.length) {
        this.weatherData = weather[this.whenIndex];
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

    @Input()
    set when(whenIndex: number) {
      this.whenIndex = whenIndex;
    }
}
