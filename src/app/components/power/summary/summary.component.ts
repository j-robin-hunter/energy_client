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
  private echartsIntance: any;

  public spinner: boolean = true;
  public currentProvided: number = 0;
  public summary: any = [];
  public updateOptions: any;
  public options = {};

	constructor(private meterReadingService: MeterReadingService,
              private configService: ConfigService,
              private eventService: EventService) {

    let lookup = configService.getLookup({
      'grid': ['total_power'],
      'solar': ['total_power'],
      'battery': ['total_power', 'state_of_charge'],
      'wind': ['total_load'],
      'load': ['total_load']
    });
    let colors = {'grid': '#c62828', 'solar': '#009688', 'battery': '#0277bd', 'wind': '#546e7a'};
    let legend = [];
    let series = [];
    Object.keys(lookup).forEach((item, index) => {
      if (lookup[item]['key'] == 'total_power' ) {
        let rating = 0;
        if (lookup[item]['type'] == 'solar' || lookup[item]['type'] == 'wind') {
          configService.getConfigurationItemValues(lookup[item]['type']).forEach(type => {
            if (type['total_power'].id == item) {
              rating += type.detail.rating || 0;
            }
          });
        }
        this.summary.push({
          'name': item,
          'type': lookup[item]['type'],
          'itemindex': lookup[item]['index'],
          'percent': 0,
          'power': 0,
          'rating': rating,
          'detail': 0});
        let name = lookup[item]['type'];
        legend.push({
          name: name,
          icon: 'image://',
          textStyle: {
            color: colors[lookup[item]['type']]
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
                  color: colors[lookup[item]['type']],
                  borderWidth: 4,
                  borderColor: colors[lookup[item]['type']]
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
      this.refreshData(meterReadings, lookup);
    });
  }

  ngOnInit() {
    this.transitionendSubscription = this.eventService.onTransitionend$.pipe().subscribe(() => {
      if (this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0) {
        this.echartsIntance.resize({
          width: this.container.nativeElement.offsetWidth
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
    this.echartsIntance = chart;
  }

  refreshData(meterReadings, lookup) {
    let calculatedLoad = 0;
    this.summary.forEach(provider => {
      provider.power = 0;
      provider.percent = 0;
      provider.detail = 0;
    });
    this.currentProvided = 0;
    meterReadings.forEach(readings => {
      let reading = readings[readings.length - 1];
      let index = Object.keys(lookup).indexOf(reading.id);
      if (index >= 0) {
        if (lookup[reading.id].source == reading.source) {
          let value =  Math.round(reading.reading);
          if (lookup[reading.id].key == 'total_load') {
            this.currentProvided += value;
          } else if (lookup[reading.id].key == 'total_power') {
            this.summary[index]['power'] += value;
            if (value > 0) {
              calculatedLoad += value;
            }
            if (lookup[reading.id].type == 'solar' || lookup[reading.id].type == 'wind') {
              if (this.summary['rating'] != 0) {
                this.summary[index]['detail'] = (this.summary[index]['power'] / this.summary[index]['rating']) * 100;
              }
            }
          } else if (lookup[reading.id].key == 'state_of_charge') {
            let i = 0;
            for (i = 0; i < this.summary.length; i++) {
              if (this.summary[i].itemindex == lookup[reading.id].index) {
                break;
              }
            }
            this.summary[i].detail += value;
          }
        }
      }
    });
    let series = this.options['series'];
    this.summary.forEach((provider, index) => {
      if (provider.power > 0) {
        let percent = (provider.power / calculatedLoad) * 100;
        provider.percent = percent;
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
