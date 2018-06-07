import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';
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
  transitionendSubscription: Subscription;
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
  series = [];
  updateOptions: any;
  options = {
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
    yAxis: {
      type: 'value',
      name: 'watts',
      boundaryGap: [0, '10%'],
      splitLine: {
        show: true
      }
    }
  };

  constructor(private measurementsService: MeasurementsService, private eventService: EventService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refreshConsumerData(measurements);
    });
    let colors = chroma.scale(['orange','purple']).mode('hcl').colors(this.consumers.length);
    this.updateOptions = {
      color: colors
    }
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
    this.echartsIntance.resize({width: 'auto', height: 'auto'});
  }

  refreshConsumerData(measurements) {
    let legend = [];
    this.consumers.forEach((item, index) => {
      legend.push({'name': measurements.data[item].id});
      if (this.series.length == index) {
        this.series.push({
          'type': 'line',
          'smooth': true,
          'name': measurements.data[item].id,
          'areaStyle' : {'opacity': 0.5},
          'showSymbol': false,
          'data': []
        });
      }
      let time = new Date(measurements.data[item].time);
      let value = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
      let dataLength = this.series[index].data.length;
      let data = {
          'name': measurements.data[item].id,
          'value':[value, measurements.data[item].value]
        };
      if (dataLength == 0) {
        this.series[index].data.push(data);
      } else {
        if (this.series[index].data[dataLength - 1].value[0] != value) {
          this.series[index].data.push(data);
        }
      }
    });

    this.updateOptions = {
      legend: {
        show: true,
        type: 'scroll',
        data: legend
      },
      series: this.series
    };
  }
}
