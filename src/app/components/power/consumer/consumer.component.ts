import { Component, OnInit } from '@angular/core';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { MeasurementsService } from '../../../services/measurements.service';


@Component({
  selector: 'app-consumer',
  templateUrl: './consumer.component.html',
  styleUrls: ['./consumer.component.css']
})
export class ConsumerComponent implements OnInit {
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
          boundaryGap: [0, '15%'],
          splitLine: {
              show: true
          }
      }
  };

  constructor(private measurementsService: MeasurementsService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refreshConsumerData(measurements);
    });
  }

  ngOnInit() {}

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
    console.log(this.updateOptions);
  }
}
