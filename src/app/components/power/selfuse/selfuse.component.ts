import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MeterReadingService } from '../../../services/meter-reading.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-selfuse',
  templateUrl: './selfuse.component.html',
  styleUrls: ['./selfuse.component.css']
})
export class SelfuseComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;
  private configKeys = {
    'grid': ['total_power'],
    'solar': ['total_power'],
    'battery': ['total_power', 'state_of_charge']
  };
  private maxBatteryChargePower: number = 1000;
  private maxBatteryDischargePower: number = 1000;
  private batteryCapacity: number = 0;
  private batteryEnabled: boolean = false;
  private batteryAvailableAt: number = 25;
  private batteryMaxDischarge: number = 90;
  private echartsInstance: any;

  public updateOptions: any;
  public options = {
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
          formatter:'{a|Charge\n{value}W}',
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

  constructor(private meterReadingService: MeterReadingService, private configService: ConfigService, private eventService: EventService) {
    let batteryDetails = configService.getConfigurationPowerValues('battery', 'detail');
    this.maxBatteryChargePower =
      (batteryDetails[0]['max_charge_current'] * batteryDetails[0]['voltage']) || this.maxBatteryChargePower;
    this.maxBatteryDischargePower =
      (batteryDetails[0]['max_discharge_current'] * batteryDetails[0]['voltage']) || this.maxBatteryDischargePower;
    this.batteryCapacity = batteryDetails[0]['capacity'] || this.batteryCapacity;
    this.batteryAvailableAt = parseFloat(batteryDetails[0]['available_at']) || this.batteryAvailableAt;
    this.batteryMaxDischarge = parseFloat(batteryDetails[0]['max_discharge']) || this.batteryMaxDischarge;

    let power = configService.getPower(this.configKeys);
    meterReadingService.meterReadingSource$.subscribe(meterReadings => {
      this.refreshData(meterReadings, power);
    });
  }

  ngOnInit() {
    this.transitionendSubscription = this.eventService.onTransitionend$.pipe().subscribe(() => {
      if (this.container.nativeElement.offsetWidth != 0 && this.container.nativeElement.offsetWidth != 0) {
        this.echartsInstance.resize({
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
    this.echartsInstance = chart;
  }

  refreshData(meterReadings, power) {
    let load = 0;
    let soc = 0;
    let charge = 0;
    let solar = 0;
    let grid = 0;
    let ids = Object.keys(power);
    meterReadings.forEach(readings => {
      let reading = readings[readings.length - 1];
      if (ids.includes(reading.id)) {
        if (power[reading.id].module == reading.module) {
          switch (power[reading.id].key) {
            case 'total_load':
              load += Math.round(reading.value);
              break;
            case 'state_of_charge':
              soc += Math.round(reading.value);
              break;
            case 'total_power':
              if (power[reading.id].type == 'grid') {
                grid += Math.round(reading.value);
              } if (power[reading.id].type == 'solar') {
                solar += Math.round(reading.value);
              } if (power[reading.id].type == 'battery') {
                charge += Math.round(reading.value);
              }
              break;
          }
        }
      }
    });

    let hours = this.batteryHours(soc, load) + this.solarHours();
    let maxHours = 12;
    while (hours > maxHours) {
      maxHours = maxHours * 2;
    }

    let batteryCharge = -1 * (charge / Math.max(this.maxBatteryChargePower, this.maxBatteryDischargePower));

    let batteryColor = '#0000e0';
    if (batteryCharge > 0) {
      batteryColor = '#009688';
    }
    batteryCharge = Math.abs(batteryCharge);
    if (batteryCharge > 1) {
      batteryCharge = 1
    }

    let excess = grid;
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
              color: [[soc / 100, '#00ee00'],[1,'#e0f2f1']]
            }
          },
          data: [soc]
        },
        {
          axisLine: {
            lineStyle: {
              color: [[batteryCharge, batteryColor],[1,'#e0f2f1']]
            }
          },
          data: [-1 * charge]
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

  batteryHours(soc, load) {
    let hours = 0;

    // Battery will only discharge if it has reached 25% charge. Once it is enabled it will discharge
    // until it reaches 10% at which point it will not discharge again until it has reached 25%
    if (soc >= this.batteryAvailableAt) {
      this.batteryEnabled = true;
    }
    if (soc <= 100 - this.batteryMaxDischarge) {
      this.batteryEnabled = false
    }
    if (this.batteryEnabled) {
      let charge = this.batteryCapacity * 0.9 * (soc/100);
      hours = Math.round(charge/(load/240));
    }
    return hours;
  }

  solarHours() {
    return 0;
  }
}
