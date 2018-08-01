import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { MeterReadingService } from '../../../services/meter-reading.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.css']
})
export class ProviderComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;
  private echartsInstance: any;

  private provider: any = [];
  public updateOptions: any;
  public options = {};

  constructor(private configService: ConfigService, private meterReadingService: MeterReadingService, private eventService: EventService) {
    let power = configService.getPower({
      'grid': ['meter'],
      'solar': ['meter'],
      'battery': ['meter', 'state_of_charge'],
      'wind': ['meter'],
      'load': ['meter']
    });
    let colors = {'grid': '#c62828', 'solar': '#009688', 'battery': '#0277bd', 'wind': '#546e7a'};
    let legend = [];
    let series = [];

    Object.keys(power).forEach((item, index) => {
      this.provider.push({
        'name': item,
        'itemindex': power[item]['index'],
      });
      let yindex = 0;
      if (power[item]['key'] == 'state_of_charge') {
        yindex = 1;
      }
      series.push({
        type: 'line',
        name: item,
        smooth: true,
        showSymbol: false,
        yAxisIndex: yindex,
        /*
        areaStyle: {
            opacity: 0.3
        },
        */
        lineStyle: {
          color: colors[power[item]['type']]
        },
        data: []
      });
    });

    this.options = {
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              animation: false
          }
      },
      grid: {
          left: '0%',
          right: '3%',
          bottom: '3%',
          containLabel: true
      },
      legend: {
        show: true,
        type: 'scroll'
      },
      dataZoom: [
        {
            show: true,
            realtime: true
        }
      ],
      xAxis: {
          type: 'time',
          splitLine: {
              show: false
          }
      },
      yAxis: [
        {
          type: 'value',
          name: 'watts',
          boundaryGap: [0, '15%'],
          splitLine: {
              show: false
          }
        },
        {
          type: 'value',
          name: '%',
          boundaryGap: ['-10%', '10%'],
          splitLine: {
              show: false
          },
          min: 0,
          max: 100
        }
      ],
      animation: false,
      series: series
    };

    meterReadingService.meterReadingSource$.subscribe(meterReadings => {
      this.refreshData(meterReadings, power);
    });
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
  }

  ngOnDestroy() {
    if (this.transitionendSubscription) {
       this.transitionendSubscription.unsubscribe();
     }
  }

  onChartInit(chart) {
    this.echartsInstance = chart;
    this.echartsInstance.resize({
      width: this.container.nativeElement.offsetWidth,
      height: this.container.nativeElement.offsetHeight
    });
  }

  refreshData(meterReadings, power) {
    let ids = Object.keys(power);
    let series = this.options['series'];

    meterReadings.forEach(readings => {
      readings.forEach(reading => {
        if (ids.includes(reading.id)) {
          if (power[reading.id].module == reading.module) {
            let index = Object.keys(power).indexOf(reading.id);
            let time = new Date(reading.time);
            let timeValue = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
            series[index].data.push({
              'name': reading.id,
              'value':[timeValue, Math.round(reading.reading)]
            });
            while (reading.time - new Date(series[index].data[0].value[0]).getTime() > (1000*60*60*24)) {
              series[index].data.shift();
            }
          }
        }
      });
    });

    this.updateOptions = {
      series: series
    };
  }
}
