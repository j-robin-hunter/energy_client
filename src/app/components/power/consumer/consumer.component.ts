import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeterReadingService } from '../../../services/meter-reading.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';
import * as chroma from 'chroma-js';

@Component({
  selector: 'app-consumer',
  templateUrl: './consumer.component.html',
  styleUrls: ['./consumer.component.css']
})
export class ConsumerComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;

  private configKeys = {
    'load': ['meter']
  };

  private seriesData = [];
  private series = [];
  private consumers = [];
  private echartsInstance: any;
  public updateOptions: any;
  public options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    },
    grid: {
      left: '0%',
      right: '3%',
      bottom: '15%',
      containLabel: true
    },
    dataZoom: [
      {
        show: true,
        realtime: true
      }
    ],
    legend: {
      type: 'scroll'
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: true
      }
    },
    yAxis: {
      type: 'value',
      name: 'watts',
      boundaryGap: [0, '10%'],
      splitLine: {
        show: true
      }
    },
    animation: false
  };

  constructor(private configService: ConfigService, private meterReadingService: MeterReadingService, private eventService: EventService) {
    let power = configService.getPower(this.configKeys);
    let circuit = {};
    Object.keys(power).forEach(key => {
      if (power[key].circuit) {
        power[key].circuit.forEach(item => {
          circuit[item.id] = {'module': item.module};
        });
      }
    });
    let legend = [];
    // Use sorted ids so that the colours used are in a known order that can be
    // reproduced in other components if necessary
    Object.keys(circuit).sort().forEach(item => {
      this.consumers.push(item);
      legend.push({'name': item});
      this.series.push({
        'type': 'line',
        'smooth': true,
        'name': item,
        /*
        'areaStyle' : {'opacity': 0.5},
        */
        'showSymbol': false,
        'data': []
      });
    });

    let colors = chroma.scale(['orange','purple']).mode('hcl').colors(this.series.length);
    this.updateOptions = {
      color: colors,
      legend: {
        data: legend
      },
      series: this.series
    }

    meterReadingService.meterReadingSource$.subscribe(meterReadings => {
      this.refreshData(meterReadings, power, circuit);
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
    this.echartsInstance.resize({width: 'auto', height: 'auto'});
  }

  refreshData(meterReadings, power, circuit) {
    let seriesLookup = {};
    this.series.forEach((item, index) => {
      seriesLookup[item.name] = index;
    });
    let ids = Object.keys(power);
    let circuit_ids = Object.keys(circuit);
    let other_loads = 0;
    meterReadings.forEach(readings => {
      readings.forEach(reading => {
        if ((circuit_ids.includes(reading.id)  && circuit[reading.id].module) || (ids.includes(reading.id) && power[reading.id].module == reading.module)) {
          if (circuit_ids.includes(reading.id)) {
            let time = new Date(reading.time);
            let timeValue = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
            let data = {
              'name': reading.id,
              'value':[timeValue, Math.round(reading.reading)]
            };
            let seriesData = this.series[seriesLookup[reading.id]].data;
            seriesData.push(data);
            while (reading.time - new Date(seriesData[0].value[0]).getTime() > (1000*60*60*24)) {
              seriesData.shift();
            }
          }
        }
      });
    });

    this.updateOptions = {
      series: this.series
    };
  }
}
