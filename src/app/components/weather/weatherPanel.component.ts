import { Component, OnInit } from '@angular/core';
import { WeatherService,  ICoord, IWeather } from '../../services/weather.service';
import { timer } from 'rxjs/observable/timer';
import * as SunCalc from 'suncalc';
import * as Moment from 'moment';

@Component({
  selector: 'app-weatherPanel',
  templateUrl: './weatherPanel.component.html',
  styleUrls: ['./weatherPanel.component.css']
})
export class WeatherPanelComponent implements OnInit {
  source = timer(1000, 2000);
  coord: ICoord;
  weather: Array<IWeather[]>;

  pvForecastConfig;
  pvForecastDataSource;
  windForecastConfig;
  windForecastDataSource;

  constructor(private weatherService: WeatherService) {
    this.coord = {
      lat: 52.2015252,
      lon: 0.3986641
      //lat: 47.3237324,
      //lon: 12.677848
    }
    this.pvForecastConfig = {
      "type": "msarea",
      "width": "100%",
      "height": "150"
    }
    this.pvForecastDataSource = {
      "chart": {
        "caption": "Cloud & Solar Forecast",
        "numbersuffix": "%",
        "theme": "fint",
        "showValues": "0",
        "drawAnchors": "0",
        "yAxisMaxValue": "70",
        "paletteColors": "#004d40,#e0f2f1",
        "labeldisplay": "stagger",
        "labelStep": "2",
        "legendPosition": "right",
        "showLegend": "0"
      },
      "categories": [{
        "category" :[{}]
      }],
      "dataset": [{
        "seriesname": "solar",
        "alpha": "100",
        "data": [{}]
      },{
        "seriesname": "cloud",
        "alpha": "65",
        "data": [{}]
      }]
    }
    this.windForecastConfig = {
      "type": "column2d",
      "width": "100%",
      "height": "150"
    }
    this.windForecastDataSource = {
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
  }

  ngOnInit() {
    /**
    const subscribe = this.source.subscribe(val => {
      if (val % 10 == 0)
        this.readWeather();
      if (val % 60 == 0)
        this.readForecast();
    });
    **/
  }

  /**
  readWeather() {
    //this.weatherService.weatherForecast(this.coord, 'metric').subscribe(result => {
    //  this.weather = result;
    //  this.weatherNow = this.weather[0];
    //});
    this.weatherService.weatherAPICall(this.coord).subscribe((weather: any) => {
      //this.weatherNow = this.updateWeather(weather);
      this.weatherNow.location = weather.name;
      this.weatherNow.sunrise = weather.sys.sunrise;
      this.weatherNow.sunset = weather.sys.sunset;
    });
  }

  readForecast() {
    this.weatherService.forecastAPICall(this.coord).subscribe((forecast: any) => {
      if (forecast.list.length >=2) {
        this.weatherSoon = this.updateWeather(forecast.list[0]);
        this.weatherLater = this.updateWeather(forecast.list[1]);
      }
      this.weatherSoon.location = this.weatherNow.location;
      this.weatherLater.location = this.weatherNow.location;

      this.pvForecastDataSource.categories[0].category = [];
      this.pvForecastDataSource.dataset[0].data = [];
      this.pvForecastDataSource.dataset[1].data = [];
      this.windForecastDataSource.data = [];

      this.pvForecastDataSource.categories[0].category.push({"label": Moment(new Date(this.weatherNow.when * 1000)).format("HH:mm")});
      this.pvForecastDataSource.dataset[0].data.push({"value": this.effectiveSolar(this.weatherNow.when * 1000, this.weatherNow.cloud)});
      this.pvForecastDataSource.dataset[1].data.push({"value": this.weatherNow.cloud});
      this.windForecastDataSource.data.push({"label": Moment(new Date(this.weatherNow.when * 1000)).format("HH:mm"), "value": this.weatherNow.speed  * 3.6});

      forecast.list.forEach(element => {
        this.pvForecastDataSource.categories[0].category.push({"label": Moment(new Date(element.dt * 1000)).format("HH:mm")});
        this.pvForecastDataSource.dataset[0].data.push({"value":this.effectiveSolar(element.dt * 1000, element.clouds.all)});
        this.pvForecastDataSource.dataset[1].data.push({"value":element.clouds.all});
        this.windForecastDataSource.data.push({"label":Moment(new Date(element.dt * 1000)).format("HH:mm"), "value":element.wind.speed * 3.6});
        if (element.dt % 86400 == 0) {
          this.pvForecastDataSource.categories[0].category.push({"vLine": "true", "label": Moment(new Date(element.dt * 1000)).format("D MMM"), "showLabelBorder": "0", "labelHAlign": "left"});
          this.windForecastDataSource.data.push({"vLine": "true", "label": Moment(new Date(element.dt * 1000)).format("D MMM"), "showLabelBorder": "0", "labelHAlign": "left"});
        }
      });
    });
  }
  **/

  updateWeather(data: any) {
    return {
      "when": data.dt,
      "description": data.weather[0].description,
      "icon": '../assets/images/weather/' + data.weather[0].icon + '.png',
      "temp": data.main.temp,
      "metricTempUnit": true,
      "speed": data.wind.speed,
      "direction": data.wind.deg,
      "metricSpeed": true,
      "cloud": data.clouds.all,
      "pressure": data.main.pressure,
      "humidity": data.main.humidity
    }
  }
}

export class WeatherData {
  when: number;
  location?: string;
  description: string;
  icon: string;
  temp: number;
  metricTempUnit: boolean;
  speed: number;
  direction: number;
  metricSpeed: boolean;
  cloud: number;
  pressure: number;
  humidity: number;
  sunrise?: number;
  sunset?: number;

  constructor() {
    this.metricTempUnit = true;
    this.metricSpeed = true;
    this.icon = '../assets/images/weather/volcano.png'
    this.direction = 0;
  }
}
