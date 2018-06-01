import { Component, OnInit } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.css']
})
export class ProviderComponent implements OnInit {
  gridData = [];
  loadData = [];
  solarData = [];
  batteryData = [];
  chargeData = [];

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
          boundaryGap: [0, '15%'],
          splitLine: {
              show: false
          },
          min: 0,
          max: 100
        }
      ],
      series: [
        {
          type: 'line',
          name: 'Grid',
          smooth: true,
          showSymbol: false,
          areaStyle: {
              opacity: 0.3
          },
          lineStyle: {
            color: '#ee0000'
          },
          data: this.gridData
        },
        {
          type: 'line',
          name: 'Load',
          smooth: true,
          showSymbol: false,
          areaStyle: {
              opacity: 0.3
          },
          lineStyle: {
            color: '#a0a0a0'
          },
          data: this.loadData
        },
        {
          type: 'line',
          name: 'Solar',
          smooth: true,
          showSymbol: false,
          areaStyle: {
              opacity: 0.3
          },
          lineStyle: {
            color: '#00ee00'
          },
          data: this.solarData
        },
        {
          type: 'line',
          name: 'Battery',
          smooth: true,
          showSymbol: false,
          areaStyle: {
              opacity: 0.3
          },
          lineStyle: {
            color: '#0000ee'
          },
          data: this.batteryData
        },
        {
          type: 'line',
          name: 'Charge',
          smooth: true,
          showSymbol: false,
          yAxisIndex: 1,
          areaStyle: {
              opacity: 0.3
          },
          lineStyle: {
            color: '#005500'
          },
          data: this.chargeData
        }
      ]
  };

  constructor(private measurementsService: MeasurementsService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refreshProviderData(measurements);
    });

  }

  ngOnInit() {}

  refreshProviderData(measurements) {
    // Sometimes generates a spurious value. If it dows ignore all readings
    if (measurements.data.pload.value < 30000) {
      let time = new Date(measurements.data.pgrid.time);
      let value = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
      this.gridData.push({
        'name': 'Grid',
        'value':[value, measurements.data.pgrid.value]
      });

      value = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
      this.loadData.push({
        'name': 'Load',
        'value':[value, measurements.data.pload.value]
      });

      let pSolar = Math.round(measurements.data.vpv.value * measurements.data.ipv.value);
      value = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
      this.solarData.push({
        'name': 'Solar',
        'value':[value, pSolar]
      });

      let pBattery = Math.round(measurements.data.vbattery.value * measurements.data.ibattery.value);
      value = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
      this.batteryData.push({
        'name': 'Battery',
        'value':[value, pBattery]
      });

      value = [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/') + ' ' + time.toTimeString().split(' ')[0];
      this.chargeData.push({
        'name': 'Charge',
        'value':[value, measurements.data.soc.value]
      });

      this.updateOptions = {
        series: [
          {
            data: this.gridData
          },
          {
            data: this.loadData
          },
          {
            data: this.solarData
          },
          {
            data: this.batteryData
          },
          {
            data: this.chargeData
          }
        ]
      };
    }
  }
}
