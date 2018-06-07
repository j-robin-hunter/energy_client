import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';
import * as chroma from 'chroma-js';

@Component({
  selector: 'app-whatuses',
  templateUrl: './whatuses.component.html',
  styleUrls: ['./whatuses.component.css']
})
export class WhatusesComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;
  transitionendSubscription: Subscription;
  config: any;
  testOne = 0;
  lastValidLoad = 0;
  maxPower = 5000;
  consumers =  [
    'downstairs_power',
    'upstairs_power',
    'over_garage_power',
    'kitchen_power',
    'living_room_and_dmx',
    'kitchen_island',
    'ovens',
    'washing_machines',
    'water_heater',
    'evolution',
    'lighting'
  ];
  echartsIntance: any;
  updateOptions: any;
  options = {
    grid: {
        top: '5%',
        left: '1%',
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

	constructor(private measurementsService: MeasurementsService, private eventService: EventService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refresh(measurements);
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

  refresh(measurements) {
    let consumerData = [];
    let monitored = 0;
    let colors = chroma.scale(['orange','purple']).mode('hcl').colors(this.consumers.length);
    this.consumers.forEach((item, index) => {
      monitored = monitored + measurements.data[item].value;
      consumerData.push({
        'name': measurements.data[item].id,
        'value': measurements.data[item].value,
        'itemStyle': {color: colors[index]}
      });
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
