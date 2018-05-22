import { Component, OnInit } from '@angular/core';
import { WeatherService, IWeather } from '../../../services/weather.service';
import { Subscription }   from 'rxjs';
import * as Moment from 'moment';

@Component({
  selector: 'app-wind-forecast',
  templateUrl: './wind-forecast.component.html',
  styleUrls: ['./wind-forecast.component.css']
})
export class WindForecastComponent implements OnInit {
  windData: any[];
  dates: any;
  markDates: any;

  updateOptions: any;
  options = {
    title: {
        text: 'Wind Forecast',
        left: 'center'
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    tooltip : {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    xAxis : [
        {
            type : 'category',
            boundaryGap : true,
            data : this.dates
        }
    ],
    yAxis : [
        {
            type : 'value',
            name: 'kph',
            nameLocation: 'center',
            nameGap: 25
        }
    ],
    series : [
        {
            name:'wind',
            type: 'bar',
            itemStyle: {
                color: '#004d40',
                opacity: 0.8
            },
            markLine : {
                silent: true,
                animation: false,
                lineStyle: {
                    normal: {
                        type: 'solid',
                        color: '#808080'
                    }
                },
                symbol: 'circle',
                symbolSize: 0,
                data : [
                    {
                        xAxis: 5,
                        label: {
                            formatter: '18th March'
                        },
                    },
                    {
                        xAxis: 8,
                        label: {
                            formatter: '19th March'
                        },
                    }
                ]
            },
            showSymbol: false
        }
    ]
  };

  constructor(private weatherService: WeatherService) {
    weatherService.weatherSource$.subscribe(weather => {
      this.updateForecast(weather)
    });
  }

  ngOnInit() {
  }

  updateForecast(weather: Array<IWeather>) {
    this.windData = [];
    this.dates = [];
    this.markDates = [];
    weather.forEach((entry, i) => {
      this.dates.push(Moment(new Date(entry.when * 1000)).format("HH:mm"));
      this.windData.push(entry.speed.value);
      if (entry.when % 86400 == 0) {
        this.markDates.push({'xAxis': i, 'label': {'formatter':Moment(new Date(entry.when * 1000)).format("D MMM")}});
      }
    });
    this.updateOptions = {
      xAxis: {data: this.dates},
      series: [
        {
          data: this.windData,
          markLine: {data: this.markDates}
        }
      ]
    };
  }

  updateForecastOld(weather: Array<IWeather>) {
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
