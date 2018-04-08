import { Component, OnInit } from '@angular/core';
import { WeatherService, IWeather } from '../../../services/weather.service';
import { Subscription }   from 'rxjs/Subscription';
import * as SunCalc from 'suncalc';
import * as Moment from 'moment';

@Component({
  selector: 'app-cloud-solar-forecast',
  templateUrl: './cloud-solar-forecast.component.html',
  styleUrls: ['./cloud-solar-forecast.component.css']
})
export class CloudSolarForecastComponent implements OnInit {
  cloudSolarForecastConfig = {
    "type": "msarea",
    "width": "100%",
    "height": "150"
  }
  cloudSolarForecastDataSource = {
    "chart": {
      "caption": "Cloud & Solar Forecast",
      "numbersuffix": "%",
      "theme": "fint",
      "showValues": "0",
      "drawAnchors": "0",
      "yAxisMaxValue": "100",
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

  constructor(private weatherService: WeatherService) {
    weatherService.weatherSource$.subscribe(weather => this.updateForecast(weather));
  }

  ngOnInit() {
  }

  updateForecast(weather: Array<IWeather>) {
    this.cloudSolarForecastDataSource.categories[0].category = [];
    this.cloudSolarForecastDataSource.dataset[0].data = [];
    this.cloudSolarForecastDataSource.dataset[1].data = [];

    weather.forEach(element => {
      this.cloudSolarForecastDataSource.categories[0].category.push({"label": Moment(new Date(element.when * 1000)).format("HH:mm")});
      this.cloudSolarForecastDataSource.dataset[0].data.push({"value": this.effectiveSolar(element.when * 1000, element.where.lat, element.where.lon, element.cloud)});
      this.cloudSolarForecastDataSource.dataset[1].data.push({"value": element.cloud});
      if (element.when % 86400 == 0) {
        this.cloudSolarForecastDataSource.categories[0].category.push({"vLine": "true", "label": Moment(new Date(element.when * 1000)).format("D MMM"), "showLabelBorder": "0", "labelHAlign": "left"});
      }
    });
  }

  effectiveSolar(when: number, lat: number, lon: number, cloud: number) {
    var solarNoon = SunCalc.getTimes(new Date(), lat, lon).solarNoon;
    var maxSolarAltitude = SunCalc.getPosition(solarNoon, lat, lon).altitude;
    var solar = (SunCalc.getPosition(new Date(when), lat, lon).altitude / maxSolarAltitude) * 100;
    if (solar > 0) {
      solar = solar * ((100 - cloud) / 100);
    } else {
      solar = 0;
    }
    return Math.round(solar);
  }
}
