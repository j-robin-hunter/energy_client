import { Component, OnInit, OnDestroy, Input} from '@angular/core';
import { WeatherService, IWeather, IWhere, IValue } from '../../../services/weather.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {

  private onWeatherSubscription: Subscription;
  public weatherData: IWeather;
  public whenIndex: number = 0;

  constructor(private weatherService: WeatherService) {
  }

  ngOnInit() {
    this.onWeatherSubscription = this.weatherService.onWeather$.subscribe(weather => {
      if (this.whenIndex >= 0 && this.whenIndex < weather.length) {
        this.weatherData = weather[this.whenIndex];
      }
    });
  }

  ngOnDestroy() {
    if (this.onWeatherSubscription) {
       this.onWeatherSubscription.unsubscribe();
     }
  }

  @Input()
  set when(whenIndex: number) {
    this.whenIndex = whenIndex;
  }
}
