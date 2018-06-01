import { Component, OnInit } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
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
  updateOptions: any;
  options = {
    grid: {
        left: '0%',
        right: '0%',
        bottom: '0%',
        containLabel: true
    },
    tooltip: {
      trigger: 'item',
      formatter: "{b}:<br/>{c}W ({d}%)"
    },
    legend: {
      show: true,
      orient: 'vertical',
      x: 'left',
      left: '65%',
      top: 'middle',
      data: []
    },
    series: [
      {
        name:'provider',
        type:'gauge',
        radius: '50%',
        max: 5000,
        center: ['35%', '50%'],
        pointer: {
          width: 3
        },
        splitNumber: 1,
        axisLine: {
          lineStyle: {
            width: 15,
            color: [[1, '#f8f8f8']]
          }
        },
        axisLabel: {
          color: '#404040'
        },
        itemStyle: {
          color: '#404040'
        },
        detail: {
          offsetCenter: ['0%', '-30%'],
          color: '#404040',
          show: false,
          formatter:'{value}W',
          fontStyle: 'bold',
          fontSize: 18
        },
        data:[0]
      },
      {
        name:'consumer',
        type:'pie',
        selectedMode: 'single',
        radius: ['55%', '70%'],
        center: ['35%', '50%'],
        label: {
          normal: {
            show: false
          }
        },
        hoverOffset: 1,
        data:[]
      },
      {
        name: 'excess',
        type: 'gauge',
        radius: '50%',
        clockwise: false,
        startAngle: -130,
        endAngle: -50,
        min: 3000,
        max: 0,
        center: ['35%', '50%'],
        pointer: {
          show: false
        },
        itemStyle: {
          color: '#ffffff',
          borderColor: '#404040'
        },
        detail: {
          offsetCenter: ['0%', '65%'],
          color: '#404040',
          show: false,
          formatter:'{value}W',
          fontStyle: 'bold',
          fontSize: 16
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        splitLine: {
          show: false
        },
        splitNumber: 1,
        axisLine: {
          lineStyle: {
            width: 15,
            color: [[1, '#f8f8f8']]
          }
        },
        data: []
      }
    ]
  };

	constructor(private measurementsService: MeasurementsService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refreshSummaryData(measurements);
    });
  }

  ngOnInit() {}

	refreshSummaryData(measurements) {
    let legend = [];
    this.consumers.forEach((item) => {
      legend.push({'name': measurements.data[item].id, 'icon': 'circle'});
    });
    let provider = this.refreshProvider(measurements);
    this.updateOptions = {
      legend: {
        data: legend
      },
      series: [
        {
          axisLine: {
            lineStyle: {
              color: provider['provider']['components']
            }
          },
          detail: {
            show: true
          },
          data: provider['provider']['total']
        },
        {
          data: this.refreshConsumer(measurements)
        },
        {
          axisLine: {
            lineStyle: {
              color: provider['excess']['components']
            }
          },
          detail: {
            show: true
          },
          data: provider['excess']['total']
        },
      ]
    };
  }

  refreshProvider(measurements) {
    let providerData = [];
		let grid = Math.round(measurements.data.pmeter.value);
		let solar = Math.round(measurements.data.ipv.value * measurements.data.vpv.value);
		let battery = Math.round(measurements.data.ibattery.value * measurements.data.vbattery.value);
    let charge = 0;
    let excess = 0;

    if (grid >= 0) {
      excess = grid;
      grid = 0;
    } else {
      grid = Math.abs(grid);
    }

    if (battery < 0 ) {
      charge = Math.abs(battery);
			battery = 0;
		}

    let providerTotal = grid + solar + battery;
    let providerComponents = [
      [grid/5000, '#ee0000'],
      [(grid+solar)/5000, '#00ee00'],
      [(grid+solar+battery)/5000, '#0000ee'],
      [1, '#f8f8f8']];

    let excessTotal = excess + charge;
    let excessComponents = [
      [excess/3000, '#ee0000'],
      [(excess + charge)/3000, '#0000ee'],
      [1, '#f8f8f8']];

    return  {
      'provider': {
        'total': [{
          'name': '',
          'value': providerTotal,
          'itemStyle': {
            'opacity': 1
          }
        }],
        'components': providerComponents
      },
      'excess': {
        'total': [{
          'name': '',
          'value': excessTotal,
          'itemStyle': {
            'opacity': 0
          }
        }],
        'components': excessComponents
      }
    };
	}

  refreshConsumer(measurements) {
    let consumerData = [];
    let monitored = 0;
    this.consumers.forEach((item) => {
      monitored = monitored + measurements.data[item].value;
      consumerData.push({'name': measurements.data[item].id, 'value': measurements.data[item].value});
    });

    return consumerData;
  }
}
