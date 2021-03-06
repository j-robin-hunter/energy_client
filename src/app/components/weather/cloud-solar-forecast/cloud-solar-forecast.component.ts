import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WeatherService, IWeather } from '../../../services/weather.service';
import { EventService } from '../../../services/event.service';
import { Subscription }   from 'rxjs';
import * as SunCalc from 'suncalc';
import * as Moment from 'moment';

@Component({
  selector: 'app-cloud-solar-forecast',
  templateUrl: './cloud-solar-forecast.component.html',
  styleUrls: ['./cloud-solar-forecast.component.css']
})
export class CloudSolarForecastComponent implements OnInit {
  @ViewChild('cloudandsolar') container: ElementRef;

  private transitionendSubscription: Subscription;
  private resizeSubscription: Subscription;
  private onWeatherSubscription: Subscription;
  private cloudData: any[];
  private solarData: any[];
  private dates: any;
  private markDates: any;
  private echartsInstance: any;

  public updateOptions: any;
  public options = {
      title: {
        text: 'Cloud & Solar Forecast',
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#202020',
          fontWeight: 'normal'
        }
      },
    grid: {
        left: '0%',
        right: '2%',
        bottom: '3%',
        containLabel: true
    },
    tooltip : {
      trigger: 'axis',
      axisPointer: {
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            data : this.dates
        }
    ],
    yAxis : [
        {
            type : 'value',
            name: '%',
            max: 100
        }
    ],
    series : [
        {
            name:'cloud',
            type: 'line',
            z: 1,
            areaStyle: {
                color: '#e0f2f1',
                opacity: 0.7
            },
            lineStyle: {
                color: '#d0e2e1',
                opacity: 0.9
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
                symbolSize: 0
            },
            showSymbol: false,
            smooth: true
        },
        {
            name:'solar',
            type:'line',
            areaStyle: {
                color: '#004d40',
                opacity: 0.8
            },
            lineStyle: {
                opacity: 0
            },
            showSymbol: false,
            smooth: true
        }
    ]
  };

  constructor(private weatherService: WeatherService, private eventService: EventService) {
  }

  ngOnInit() {
    this.transitionendSubscription = this.eventService.onTransitionend$.pipe().subscribe(() => {
      this.echartsInstance.resize({
        width: this.container.nativeElement.offsetWidth,
        height: this.container.nativeElement.offsetHeight
      });
      this.container.nativeElement.firstChild.style.height = '100%';
    });
    this.resizeSubscription = this.eventService.onResize$.pipe().subscribe(() => {
      this.echartsInstance.resize({
        width: this.container.nativeElement.offsetWidth,
        height: this.container.nativeElement.offsetHeight
      });
      this.container.nativeElement.firstChild.style.height = '100%';
    });
    this.onWeatherSubscription = this.weatherService.onWeather$.subscribe(weather => {
      this.updateForecast(weather);
    });
  }

  ngOnDestroy() {
    if (this.transitionendSubscription) {
       this.transitionendSubscription.unsubscribe();
     }
    if (this.resizeSubscription) {
       this.resizeSubscription.unsubscribe();
     }
    if (this.onWeatherSubscription) {
       this.onWeatherSubscription.unsubscribe();
     }
  }

  onChartInit(chart) {
    this.echartsInstance = chart;
  }

  updateForecast(weather: Array<IWeather>) {
    this.cloudData = [];
    this.solarData = [];
    this.dates = [];
    this.markDates = [];
    weather.forEach((entry, i) => {
      this.dates.push(Moment(new Date(entry.when * 1000)).format("HH:mm"));
      this.cloudData.push(entry.cloud);
      this.solarData.push(this.effectiveSolar(entry.when * 1000, entry.where.lat, entry.where.lon, entry.cloud));
      if (entry.when % 86400 == 0) {
        this.markDates.push({'xAxis': i, 'label': {'formatter':Moment(new Date(entry.when * 1000)).format("D MMM")}});
      }
    });
    this.updateOptions = {
      xAxis: {data: this.dates},
      series: [
        {
          data: this.cloudData,
          markLine: {data: this.markDates}
        },
        {data: this.solarData}
      ]
    };
  }

  effectiveSolar(when: number, lat: number, lon: number, cloud: number) {
    var now = new Date(when);
    /*
    Start by getting the maximum possible solar angle at this location in the year and then
    use this to reduce the possible maximum solar for today, based on solar noon. After this
    multiply by cloud cover at the time of day to get an erstimate of available solay yeild.
    This full calculation is done on each weather forecast update and not moved to the constructor
    as the program might be running for a very long time and this would affect the initial
    calculation
    */
    var year = now.getFullYear();
    var yearStart = new Date(now.getFullYear() + 1, 0, 0, 0, 0, 0, 0).getTime();
    var maxSolarAltitudeYear = 0;
    for (let i = 0; i < 365; i++) {
      var dayMaxSolarAlitude = this.maxSolarAltitude(new Date(yearStart + (i * 86400000)), lat, lon);
      if (dayMaxSolarAlitude > maxSolarAltitudeYear) {
        maxSolarAltitudeYear = dayMaxSolarAlitude;
      }
    }
    var maxSolarAltitudeToday = this.maxSolarAltitude(now, lat, lon);
    var seasonAdjust = maxSolarAltitudeToday / maxSolarAltitudeYear;
    var solar = (SunCalc.getPosition(now, lat, lon).altitude / maxSolarAltitudeToday) * seasonAdjust * 100;
    if (solar > 0) {
      solar = solar * ((100 - cloud) / 100);
    } else {
      solar = 0;
    }
    return Math.round(solar);
  }

  maxSolarAltitude(now: Date, lat: number, lon: number) {
    return SunCalc.getPosition(SunCalc.getTimes(now, lat, lon).solarNoon, lat, lon).altitude
  }
}
