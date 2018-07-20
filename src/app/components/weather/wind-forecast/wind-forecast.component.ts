import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { WeatherService, IWeather } from '../../../services/weather.service';
import { EventService } from '../../../services/event.service';
import { Subscription }   from 'rxjs';
import * as Moment from 'moment';

@Component({
  selector: 'app-wind-forecast',
  templateUrl: './wind-forecast.component.html',
  styleUrls: ['./wind-forecast.component.css']
})
export class WindForecastComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;
  private resizeSubscription: Subscription;
  private pageshowSubscription: Subscription;
  private onWeatherSubscription: Subscription;
  private windData: any[];
  private dates: any;
  private markDates: any;
  private echartsInstance: any;

  public updateOptions: any;
  public options = {
    title: {
      text: 'Wind Forecast',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#202020',
        fontWeight: 'normal'
      }
    },
    grid: {
        left: '0%',
        right: '1%',
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
            boundaryGap : true,
            data : this.dates
        }
    ],
    yAxis : [
        {
            type : 'value',
            name: 'kph'
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
                data : []
            },
            showSymbol: false
        }
    ]
  };

  constructor(private weatherService: WeatherService, private eventService: EventService) {
  }

  ngOnInit() {
    this.transitionendSubscription = this.eventService.onTransitionend$.pipe().subscribe(() => {
      if (this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0 &&
          this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0) {
        this.echartsInstance.resize({
          width: this.container.nativeElement.offsetWidth,
          height: this.container.nativeElement.offsetHeight
        });
      }
    });
    this.pageshowSubscription = this.eventService.onPageshow$.pipe().subscribe(() => {
      if (this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0 &&
          this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0) {
        this.echartsInstance.resize({
          width: this.container.nativeElement.offsetWidth,
          height: this.container.nativeElement.offsetHeight
        });
      }
    });
    this.resizeSubscription = this.eventService.onResize$.pipe().subscribe(() => {
      if (this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0 &&
          this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0) {
        this.echartsInstance.resize({
          width: this.container.nativeElement.offsetWidth,
          height: this.container.nativeElement.offsetHeight
        });
      }
    });
    this.onWeatherSubscription = this.weatherService.onWeather$.subscribe(weather => {
      this.updateForecast(weather);
    });
  }

  ngOnDestroy() {
    if (this.transitionendSubscription) {
       this.transitionendSubscription.unsubscribe();
     }
    if (this.pageshowSubscription) {
       this.pageshowSubscription.unsubscribe();
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
    this.echartsInstance.resize({
      width: this.container.nativeElement.offsetWidth,
      height: this.container.nativeElement.offsetHeight
    });
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
}
