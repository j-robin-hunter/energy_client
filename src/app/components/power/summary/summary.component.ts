import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeterReadingService } from '../../../services/meter-reading.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;
  private echartsInstance: any;

  public spinner: boolean = true;
  public currentProvided: number = 0;
  public summary: any = [];
  public updateOptions: any;
  public options = {};

	constructor(private meterReadingService: MeterReadingService,
              private configService: ConfigService,
              private eventService: EventService) {

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
      if (power[item]['key'] == 'meter' && power[item]['type'] != 'load') {
        let rating = 0;
        configService.getConfigurationPowerValues(power[item]['type']).forEach(type => {
          if (type.detail) {
            rating += type.detail.rating || 0;
          }
        });
        this.summary.push({
          'name': item,
          'type': power[item]['type'],
          'itemindex': power[item]['index'],
          'percent': 0,
          'power': 0,
          'rating': rating,
          'detail': 0});
        let name = power[item]['type'];
        legend.push({
          name: name,
          icon: 'image://',
          textStyle: {
            color: colors[power[item]['type']]
          }
        });
        series.push({
          name: name,
          type: 'pie',
          clockWise: false,
          radius: [100 - (index * 10), 99 - (index * 10)],
          startAngle: 90,
          hoverAnimation: false,
          labelLine: {
            show: false
          },
          data: [
            {
              value: 0,
              itemStyle: {
                normal: {
                  color: colors[power[item]['type']],
                  borderWidth: 4,
                  borderColor: colors[power[item]['type']]
                }
              }
            },
            {
              value: 100,
              itemStyle: {
                normal: {
                  color: '#e0e0e0'
                }
              }
            },
            {
              value: 40,
              itemStyle: {
                normal: {
                  color: 'rgba(100, 0, 0, 0)'
                }
              }
            }
          ]
        });
      }
    });
    this.options = {
      legend: {
        type: 'plain',
        show: true,
        orient: 'vertical',
        top: '17px',
        left: 'center',
        itemGap: 0,
        textStyle: {
          fontSize: 12,
          padding: [0, 0, 0, 70]
        },
        formatter: "{name} %",
        data: legend
      },
      series: series
    };
    meterReadingService.meterReadingSource$.subscribe(meterReadings => {
      this.refreshData(meterReadings, power);
    });
  }

  ngOnInit() {
    this.transitionendSubscription = this.eventService.onTransitionend$.pipe().subscribe(() => {
      this.echartsInstance.resize({
        width: this.container.nativeElement.offsetWidth,
        height: this.container.nativeElement.offsetHeight
      });
      this.container.nativeElement.firstChild.style.height = '100%';
    });
  }

  ngOnDestroy() {
    if (this.transitionendSubscription) {
       this.transitionendSubscription.unsubscribe();
     }
  }

  onChartInit(chart) {
    this.echartsInstance = chart;
  }

  refreshData(meterReadings, power) {
    let calculatedLoad = 0
    this.summary.forEach(entry => {
      entry.power = 0;
      entry.percent = 0;
      entry.detail = 0;
    });
    this.currentProvided = 0;
    meterReadings.forEach(readings => {
      let reading = readings[readings.length - 1];
      let index = Object.keys(power).indexOf(reading.id);
      if (index >= 0) {
        if (power[reading.id].module == reading.module) {
          let value =  Math.round(reading.reading);
          if (power[reading.id].key == 'meter') {
            if (power[reading.id].type == 'load') {
              this.currentProvided += value;
            } else {
              this.summary[index]['power'] += value;
              if (value > 0) {
                calculatedLoad += value;
              }
              if (power[reading.id].type == 'solar' || power[reading.id].type == 'wind') {
                if (this.summary['rating'] != 0) {
                  this.summary[index]['detail'] = (this.summary[index]['power'] / this.summary[index]['rating']) * 100;
                }
              }
            }
          } else if (power[reading.id].key == 'state_of_charge') {
            let i = 0;
            for (i = 0; i < this.summary.length; i++) {
              if (this.summary[i].itemindex == power[reading.id].index) {
                break;
              }
            }
            this.summary[i].detail += value;
          }
        }
      }
    });
    let series = this.options['series'];
    this.summary.forEach((entry, index) => {
      if (entry.power > 0) {
        let percent = (entry.power / calculatedLoad) * 100;
        entry.percent = percent;
        if (percent > 100) {
          percent = 100;
        }
        series[index].data[0].value = percent;
        series[index].data[1].value = 100 - percent;
      } else {
        series[index].data[0].value = 0;
        series[index].data[1].value = 100;
      }
    });
    this.spinner = false;
    this.updateOptions = {
      series: series
    };
	}
}
