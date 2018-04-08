import { Component, OnInit } from '@angular/core';
import { WeatherService, IWeather } from '../../../services/weather.service';
import { Subscription }   from 'rxjs/Subscription';
import * as Moment from 'moment';

@Component({
  selector: 'app-wind-forecast',
  templateUrl: './wind-forecast.component.html',
  styleUrls: ['./wind-forecast.component.css']
})
export class WindForecastComponent implements OnInit {
  windForecastConfig = {
    "type": "column2d",
    "width": "100%",
    "height": "150"
  }
  windForecastDataSource = {
    "chart": {
      "caption": "Wind Forecast",
      "numbersuffix": "kph",
      "theme": "fint",
      "showValues": "0",
      "paletteColors": "#009688",
      "labeldisplay": "stagger",
      "labelStep": "2"
    },
    "data": [{}]
  }

  constructor(private weatherService: WeatherService) {
    weatherService.weatherSource$.subscribe(weather => this.updateForecast(weather));
  }

  ngOnInit() {
  }

  updateForecast(weather: Array<IWeather>) {
    this.windForecastDataSource.data = [];
    this.windForecastDataSource.chart.numbersuffix = weather[0].speed.unit;

    weather.forEach(element => {
        this.windForecastDataSource.data.push({"label":Moment(new Date(element.when * 1000)).format("HH:mm"), "value":element.speed.value});
      if (element.when % 86400 == 0) {
          this.windForecastDataSource.data.push({"vLine": "true", "label": Moment(new Date(element.when * 1000)).format("D MMM"), "showLabelBorder": "0", "labelHAlign": "left"});
      }
    });
  }
}
