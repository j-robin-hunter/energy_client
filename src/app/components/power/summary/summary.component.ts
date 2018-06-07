import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
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
    color: ['#003366', '#006699', '#4cabce', '#000000'],
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
      show: false,
      orient: 'vertical',
      x: 'left',
      left: '70%',
      top: 'middle',
      data: []
    },
    series: [
      {
        name:'provider',
        type:'gauge',
        radius: '80%',
        max: this.maxPower,
        center: ['50%', '50%'],
        pointer: {
          width: 3,
          length: '90%'
        },
        itemStyle: {
          normal: {
              //shadowColor: 'rgba(0, 0, 0, 0.5)',
              //shadowBlur: 10,
              //shadowOffsetX: 2,
              //shadowOffsetY: 2
              color: '#004d40'
          }
        },
        splitNumber: 1,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#e0f2f1']]
          }
        },
        axisLabel: {
          color: '#404040',
          show: false
        },
        axisTick: {
          length: 15,
          splitNumber: 2,
          lineStyle: {
            color: '#404040',
            width: 1
          }
        },
        splitLine: {
          show: true,
          length: 20,
          lineStyle: {
            color: [[1, '#404040']],
            width: 1
          }
        },
        detail: {
          offsetCenter: ['0%', '-40%'],
          color: '#404040',
          show: false,
          formatter:'Total Load\n{value}W',
          fontStyle: 'bold',
          fontSize: 14
        },
        data:[0]
      },
      {
        name:'consumer',
        type:'pie',
        selectedMode: 'single',
        radius: ['85%', '100%'],
        center: ['50%', '50%'],
        label: {
          normal: {
            show: false
          }
        },
        hoverOffset: 1,
        data:[]
      }
    ]
  };

	constructor(private measurementsService: MeasurementsService, private configService: ConfigService, private eventService: EventService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refreshSummaryData(measurements);
    });
    configService.getConfig().pipe().subscribe(config => {
        this.maxPower = config['providers']['grid']['max_power'] || this.maxPower;
        this.updateOptions = {
          series: [
            {
              max: this.maxPower,
              axisLabel: {
                show: true
              }
            },
            {
            }
          ]
        };
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

	refreshSummaryData(measurements) {
    let legend = [];
    this.consumers.forEach((item) => {
      legend.push({'name': measurements.data[item].id, 'icon': 'circle'});
    });
    let provider = this.refreshProvider(measurements);
    let load = measurements.data.pload.value;
    // Sometime pload gives spurious reading, if it dows then use a previous value
    if (load > 30000) {
      load = this.lastValidLoad;
    }

    this.updateOptions = {
      legend: {
        data: legend
      },
      series: [
        {
          axisLine: {
            lineStyle: {
              color: this.refreshProvider(measurements)
            }
          },
          detail: {
            show: true
          },
          data: [load]
        },
        {
          data: this.refreshConsumer(measurements)
        }
      ]
    };
  }

  refreshProvider(measurements) {
    let providerComponents = [[1, '#e0f2f1']];
    let load = measurements.data.pload.value;

    // Sometimes pload gives spurious reading, if it dows then use a previous value
    if (load > 0 ) {
      if (load > 30000) {
        load = this.lastValidLoad;
      }
      this.lastValidLoad = load;
      let loadPercentOfMax = load / this.maxPower;
      if (loadPercentOfMax > 1) {
        loadPercentOfMax = 1;
      }
      let grid = measurements.data.pmeter.value;
      if (grid > 0) {
        grid = 0;
      }
      grid = Math.abs(grid);
  		let solar = measurements.data.ipv.value * measurements.data.vpv.value;
  		let battery = measurements.data.ibattery.value * measurements.data.vbattery.value;
      if (battery < 0) {
        battery = 0;
      }
      let gridPercent = grid/(grid + solar + battery);
      let solarPercent = solar/(grid + solar + battery);
      let batteryPercent = battery/(grid + solar + battery);

      providerComponents = [
        [gridPercent * loadPercentOfMax, '#ee0000'],
        [(gridPercent + solarPercent) * loadPercentOfMax, '#00ee00'],
        [(gridPercent + solarPercent + batteryPercent) * loadPercentOfMax, '#0000ee'],
        [1, '#e0f2f1']
      ];
    }
    return  providerComponents;
	}

  refreshConsumer(measurements) {
    let consumerData = [];
    this.consumers.forEach((item) => {
      consumerData.push({'name': measurements.data[item].id, 'value': measurements.data[item].value});
    });

    return consumerData;
  }
}
