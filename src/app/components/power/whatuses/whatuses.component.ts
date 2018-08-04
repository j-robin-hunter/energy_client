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
  private resizeSubscription: Subscription;

  private configKeys = {
    'load': ['meter']
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
    let power = configService.getPower(this.configKeys);
    let circuit = {'Other Loads': {}};
    Object.keys(power).forEach(key => {
      if (power[key].circuit) {
        power[key].circuit.forEach(item => {
          circuit[item.id] = {'module': item.module};
        });
      }
    });
    meterReadingService.meterReadingSource$.pipe(debounceTime(500)).subscribe(meterReadings => {
      this.refresh(meterReadings, power, circuit);
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
    this.resizeSubscription = this.eventService.onResize$.pipe().subscribe(() => {
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
    if (this.resizeSubscription) {
       this.resizeSubscription.unsubscribe();
     }
  }

  onChartInit(chart) {
    this.echartsInstance = chart;
    this.echartsInstance.resize({
      width: this.container.nativeElement.offsetWidth,
      height: this.container.nativeElement.offsetHeight
    });
    this.container.nativeElement.firstChild.style.height = '0px';
  }

  refresh(meterReadings, power, circuit) {
    let consumerData = [];
    let other_loads = 0;
    let other_loads_color = 0;

    let ids = Object.keys(power);
    let circuit_ids = Object.keys(circuit);
    // Use sorted ids so that the colours used are in a known order that can be
    // reproduced in other components if necessary
    circuit_ids.sort();
    let colors = chroma.scale(['orange','purple']).mode('hcl').colors(circuit_ids.length);
    meterReadings.forEach(readings => {
      let reading = readings[readings.length - 1];
      if (circuit_ids.includes(reading.id) && circuit[reading.id].module == reading.module) {
        consumerData.push({
          'name': reading.id,
          'value': reading.reading,
          'itemStyle': {color: colors[circuit_ids.indexOf(reading.id)]}
        });
        other_loads -= reading.reading;
      } else if (ids.includes(reading.id) && power[reading.id].module == reading.module) {
        other_loads += reading.reading;
      }
    });

    // Account for any stange adding up of loads
    if (other_loads < 0) {
      other_loads = 0
    }
    consumerData.push({
      'name': 'Other Loads',
      'value': other_loads,
      'itemStyle': {color: colors[circuit_ids.indexOf('Other Loads')]}
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
