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
    'load': ['total_load', 'metered_load']
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
    let lookup = configService.getLookup(this.configKeys);
    let legend = [];
    // Use sorted ids so that the colours used are in a known order that can be
    // reproduced in other components if necessary
    Object.keys(lookup).sort().forEach(id => {
      this.consumers.push(id);
      legend.push({'name': id});
      this.series.push({
        'type': 'line',
        'smooth': true,
        'name': id,
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
      this.refreshData(meterReadings, lookup);
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

  refreshData(meterReadings, lookup) {
    let seriesLookup = {};
    let other_loads = 0;
    this.series.forEach((item, index) => {
      seriesLookup[item.name] = index;
    });
    let ids = Object.keys(lookup);
    meterReadings.forEach(readings => {
      other_loads = 0;
      readings.forEach(reading => {
        if (ids.includes(reading.id)) {
          if (lookup[reading.id].source == reading.source) {
            // Get the series for this reading from the seriesLookup
            let time = new Date(reading.time);
            let timeValue = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
            let data = {
              'name': reading.id,
              'value':[timeValue, Math.round(reading.reading)]
            };
            other_loads -= reading.reading;
            let seriesData = this.series[seriesLookup[reading.id]].data;
            seriesData.push(data);
            while (reading.id, reading.time - new Date(seriesData[0].value[0]).getTime() > (1000*60*60*24)) {
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
