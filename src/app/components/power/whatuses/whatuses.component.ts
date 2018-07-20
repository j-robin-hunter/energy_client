import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConfigService } from '../../../services/config.service';
import { MeterReadingService } from '../../../services/meter-reading.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as chroma from 'chroma-js';

@Component({
  selector: 'app-whatuses',
  templateUrl: './whatuses.component.html',
  styleUrls: ['./whatuses.component.css']
})
export class WhatusesComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;

  private configKeys = {
    'load': ['total_load', 'metered_load']
  };
  private consumers = [];
  private echartsInstance: any;
  updateOptions: any;
  options = {
    grid: {
      top: '5%',
      left: '2.3%',
      right: '5%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      name: 'watts',
      nameLocation: 'middle',
      nameGap: 20,
      type: 'value',
      position: 'top',
      inverse: true
    },
    yAxis: {
      type : 'category',
      position: 'right'
    },
    series: [
      {
        name:'power',
        type:'bar',
        data:[]
      }
    ]
  };

	constructor(private configService: ConfigService, private meterReadingService: MeterReadingService, private eventService: EventService) {
    let lookup = configService.getLookup(this.configKeys);
    meterReadingService.meterReadingSource$.pipe(debounceTime(500)).subscribe(meterReadings => {
      this.refresh(meterReadings, lookup);
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

  refresh(meterReadings, lookup) {
    let consumerData = [];
    let other_loads = 0;
    let other_loads_color = 0;
    // Use sorted ids so that the colours used are in a known order that can be
    // reproduced in other components if necessary
    let ids = Object.keys(lookup).sort();
    let colors = chroma.scale(['orange','purple']).mode('hcl').colors(ids.length);
    meterReadings.forEach(readings => {
      let reading = readings[readings.length - 1];
      if (ids.includes(reading.id)) {
        if (lookup[reading.id].source == reading.source) {
          if (lookup[reading.id].key == 'metered_load') {
            consumerData.push({
              'name': reading.id,
              'value': reading.reading,
              'itemStyle': {color: colors[ids.indexOf(reading.id)]}
            });
            other_loads -= reading.reading;
          } else if (lookup[reading.id].key == 'total_load'){
            other_loads += reading.reading;
            other_loads_color = colors[ids.indexOf(reading.id)]
          }
        }
      }
    });

    // Account for any stange adding up of loads
    if (other_loads < 0) {
      other_loads = 0
    }
    consumerData.push({
      'name': 'Other Loads',
      'value': other_loads,
      'itemStyle': other_loads_color
    });

    consumerData.sort((a, b) => {
            return a.value - b.value;
    });
    let categories = [];
    consumerData.forEach((item) => {categories.push(item.name)});

    this.updateOptions = {
      yAxis: {
        data: categories
      },
      series: [
        {
          data: consumerData
        }
      ]
    };
  }
}
