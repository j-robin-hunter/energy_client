import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-selfuse',
  templateUrl: './selfuse.component.html',
  styleUrls: ['./selfuse.component.css']
})
export class SelfuseComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;
  transitionendSubscription: Subscription;
  batteryIndex: number = 0;
  maxBatteryCharge: number = 50;
  batteryEnabled: boolean = false;
  echartsIntance: any;
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
        name: 'hours',
        type: 'gauge',
        radius: '100%',
        center: ['50%', '50%'],
        min: 0,
        max: 12,
        startAngle: 180,
        endAngle: 0,
        splitNumber: 12,
        pointer: {
          show: true,
          length: '90%',
          width: 3
        },
        itemStyle: {
          normal: {
              //shadowColor: 'rgba(0, 0, 0, 0.5)',
              //shadowBlur: 10,
              //shadowOffsetX: 2,
              //shadowOffsetY: 2,
              color: '#004d40'
          }
        },
        axisTick: {
          length: 10,
          splitNumber: 4,
          lineStyle: {
            color: '#404040',
            width: 1
          }
        },
        axisLabel: {
          show: true,
          color: '#404040'
        },
        detail: {
          offsetCenter: ['0%', '-50%'],
          show: true,
          formatter:'{a|Self Use\n(hours)}',
          rich: {
            a: {
              align: 'center',
              fontStyle: 'bold',
              fontSize: 14,
              color: '#404040',
              lineHeight: 18
            }
          }
        },
        axisLine: {
          lineStyle: {
              color: [[1, '#009688']],
              width: 20
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
        data: []
      },
      {
        name: 'charge',
        type: 'gauge',
        radius: '100%',
        center: ['50%', '50%'],
        clockwise: true,
        startAngle: 267,
        endAngle: 186,
        min: 0,
        max: 100,
        pointer: {
          show: false
        },
        detail: {
          offsetCenter: ['-25%', '35%'],
          show: true,
          formatter:'{a|Battery\n{value}%}',
          rich: {
            a: {
              align: 'left',
              fontStyle: 'bold',
              fontSize: 12,
              color: '#404040',
              lineHeight: 16
            }
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          length: 10,
          splitNumber: 10,
          lineStyle: {
            color: '#404040',
            width: 1
          }
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#e0f2f1']]
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
        splitNumber: 5,
        data: [0]
      },
      {
        name:'charge',
        type:'gauge',
        radius: '100%',
        center: ['50%', '50%'],
        min: 100,
        max: 0,
        clockwise: false,
        pointer: {
          show: false
        },
        startAngle: -59,
        endAngle: -6,
        splitNumber: 5,
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
        itemStyle: {
          color: '#404040'
        },
        detail: {
          offsetCenter: ['25%', '35%'],
          show: true,
          formatter:'{a|Charge\n{value}A}',
          rich: {
            a: {
              align: 'right',
              fontStyle: 'bold',
              fontSize: 12,
              color: '#404040',
              lineHeight: 16,
            },
          }
        },
        axisTick: {
          length: 10,
          splitNumber: 10,
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
        data:[0]
      },
      {
        name:'export',
        type:'gauge',
        radius: '100%',
        center: ['50%', '50%'],
        min: 0,
        max: 500,
        pointer: {
          show: false
        },
        startAngle: -61,
        endAngle: -87,
        splitNumber: 1,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#e0f2f1']]
          }
        },
        axisLabel: {
          color: '#404040'
        },
        itemStyle: {
          color: '#404040'
        },
        detail: {
          offsetCenter: ['18%', '57%'],
          show: true,
          formatter:'{a|Export\n{value}W}',
          rich: {
            a: {
              align: 'center',
              fontStyle: 'bold',
              fontSize: 12,
              color: '#404040',
              lineHeight: 16
            }
          }
        },
        axisTick: {
          length: 10,
          splitNumber: 5,
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
        data:[0]
      }
    ]
  };

  constructor(private measurementsService: MeasurementsService, private configService: ConfigService, private eventService: EventService) {
    measurementsService.measurementSource$.subscribe(measurements => {
      this.refreshSelfUseData(measurements);
    });
    configService.getConfig().pipe().subscribe(config => {
      let maxChargeCurrent = config['providers']['battery'][this.batteryIndex]['max_charge_current'] || this.maxBatteryCharge;
      this.maxBatteryCharge = Math.max(maxChargeCurrent, config['providers']['battery'][this.batteryIndex]['max_discharge_current']) || this.maxBatteryCharge;
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

  @Input()
  set batteryNumber(batteryIndex: number) {
    this.batteryIndex = batteryIndex;
  }

  refreshSelfUseData(measurements) {
    let hours = this.batteryHours(measurements) + this.solarHours(measurements);
    let maxHours = 12;
    while (hours > maxHours) {
      maxHours = maxHours * 2;
    }

    let batteryCharge = -1 * measurements.data.ibattery.value / this.maxBatteryCharge;

    let batteryColor = '#0000e0';
    if (batteryCharge > 0) {
      batteryColor = '#009688';
    }
    batteryCharge = Math.abs(batteryCharge);
    if (batteryCharge > 1) {
      batteryCharge = 1
    }

    let excess = measurements.data.pgrid.value;
    if (excess < 0) {
      excess = 0;
    } else {
      excess = excess/1000;
      if (excess > 1) {
        excess = 1;
      }
    }

    this.updateOptions = {
      series: [
        {
          max: maxHours,
          data: [hours]
        },
        {
          axisLine: {
            lineStyle: {
              color: [[measurements.data.soc.value / 100, '#00ee00'],[1,'#e0f2f1']]
            }
          },
          data: [measurements.data.soc.value]
        },
        {
          axisLine: {
            lineStyle: {
              color: [[batteryCharge, batteryColor],[1,'#e0f2f1']]
            }
          },
          data: [-1 * measurements.data.ibattery.value]
        },
        {
          axisLine: {
            lineStyle: {
              color: [[excess, '#ee0000'],[1,'#e0f2f1']]
            }
          },
          data: [Math.round(excess * 100)]
        }
      ]
    };
  }

  batteryHours(measurements) {
    let hours = 0;

    // Battery will only discharge if it has reached 25% charge. Once it is enabled it will discharge
    // until it reaches 10% at which point it will not discharge again until it has reached 25%
    let soc = measurements.data.soc.value;
    if (soc >= 25) {
      this.batteryEnabled = true;
    }
    if (soc <= 10) {
      this.batteryEnabled = false
    }
    if (this.batteryEnabled) {
      let charge = 126 * (measurements.data.soh.value/100) * 0.9 * (soc/100);
      hours = Math.round(charge/(measurements.data.pload.value/measurements.data.vload.value));
    }
    return hours;
  }

  solarHours(measurements) {
    return 0;
  }
}
