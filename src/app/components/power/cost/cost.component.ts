import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MeterTariffService } from '../../../services/meter-tariff.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';
import { Subscription, Observable, timer } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es';
import * as LocaleCurrency from 'locale-currency';
import * as chroma from 'chroma-js';
import * as Moment from 'moment';

const TICK = 60000;


@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.scss']
})
export class CostComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;
  private echartsInstance: any;
  private series = [];
  private startDate;
  private endDate;
  private displayPeriod;

  public periods = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
  public meterTariff: any = [];
  public cost: number = 0;
  public currency = 'GBP';
  public locale = 'en-GB'
  public amountFor: string;
  public selectedTab: number = 0;
  public fowardDisabled: boolean = true;

  public updateOptions: any;
  public options = {
    grid: {
      left: '50px',
      right: '20px',
      bottom: '30px',
      top: '10px',
    },
    legend: {
      type: 'plain',
      orient: 'horizontal',
      align: 'left',
      left: 'center',
      top: 'bottom',
      textStyle: {
        fontSize: '10'
      },
      show: true
    },
    xAxis: {
      type: 'value',
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: 'cost',
      boundaryGap: [0, '10%'],
      splitLine: {
        show: true
      },
      nameRotate: '90',
      nameLocation: 'middle',
      nameGap: '35'
    },
    animation: false
  };

  constructor(private configService: ConfigService, private meterTariffService: MeterTariffService, private eventService: EventService) {

    this.setInitialDates();

    registerLocaleData(localeDe);
    registerLocaleData(localeFr);
    registerLocaleData(localeEs);

    this.locale = configService.getConfigurationValue('locale');
    this.currency =  LocaleCurrency.getCurrency(this.locale);

    let legend = [];
    meterTariffService.getTariffs().forEach(tariff => {
      legend.push({'name': tariff['name'], 'icon': 'circle'});
      this.series.push({
        'type': 'bar',
        'name': tariff['name'],
        'areaStyle' : {'opacity': 0.5},
        'showSymbol': false,
        'barWidth': '3',
        'data': []
      });
    });

    let colors = chroma.scale(['orange','purple']).mode('hcl').colors(this.series.length);
    this.updateOptions = {
      color: colors,
      legend: {
        data: legend
      },
      series: this.series,
      yAxis: {
        name: this.currency
      }
    }

    timer(0, TICK).subscribe(val => {
      this.update();
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
    this.echartsInstance.resize({width: 'auto', height: 'auto'});
  }

  pan(event) {
    window.scrollTo(0, event.deltaY * -1);
  }

  backwardDate(event) {
    this.fowardDisabled = false;
    this.updateHistory(-1);
  }

  forwardDate(event) {
    this.updateHistory(1);
  }

  tabChange(event) {
    this.displayPeriod = this.periods[event.index];
    this.startDate = Moment(this.endDate).subtract(1, this.displayPeriod);
    this.update();
  }

  setInitialDates() {
    this.startDate = Moment().startOf('day');
    this.endDate = Moment(this.startDate).add(1, 'day');
    this.displayPeriod = 'DAY';
    this.fowardDisabled = true;
  }

  updateHistory(change) {
    this.startDate.add(change, this.displayPeriod);
    this.endDate = Moment(this.startDate).add(1, this.displayPeriod);
    if (this.endDate.isAfter(Moment().endOf('day'))) {
      if (this.displayPeriod == 'DAY') {
        this.setInitialDates();
        this.update();
      } else {
        this.selectedTab -= 1;
        this.displayPeriod = this.periods[this.selectedTab];
        this.fowardDisabled = false;
        this.updateHistory(1);
      }
    } else {
      this.update();
    }
  }

  update() {
    if (this.fowardDisabled == true && this.endDate.isBefore(Moment())) {
      this.setInitialDates();
    }
    let seriesLookup = {};
    this.series.forEach((item, index) => {
      seriesLookup[item.name] = index;
      item.data = [];
    });
    this.meterTariffService.getMeterTariffsBetween(this.startDate.valueOf(), this.endDate.valueOf()).subscribe(meterTariff => {
      let tariffData = meterTariff.data['meterTariffBetween'];
      this.meterTariff = [];
      this.cost = 0;
      tariffData.forEach(data => {
        data.forEach(tariff => {
          this.updateMeterTariff(tariff);
          let amount = tariff.amount;
          if (tariff.type == 'expenditure') {
            amount *= -1;
          }
          let data = {
            'name': tariff.name,
            'value':[tariff.time, amount]
          };
          let seriesData = this.series[seriesLookup[tariff.name]].data;
          seriesData.push(data);
        });
      });
      this.updateAmountFor();
      this.meterTariff.sort((a, b) => {
        return b.amount - a.amount;
      });
      this.updateOptions = {
        xAxis: {
          min: this.startDate.valueOf() - 900000,
          max:  this.endDate.valueOf()
        },
        series: this.series
      }
    });
  }

  updateMeterTariff(tariff) {
    let i;
    for (i = 0; i < this.meterTariff.length; i++) {
      if (this.meterTariff[i].name == tariff.name &&
        this.meterTariff[i].tariff == tariff.tariff &&
        this.meterTariff[i].tax == tariff.tax &&
        this.meterTariff[i].rateid == tariff.rateid) {
        break;
      }
    }
    if (i >= this.meterTariff.length) {
      this.meterTariff.push({'name': tariff.name, 'type': tariff.type, 'tariff': tariff.tariff, 'tax': tariff.tax, 'rateid': tariff.rateid, 'amount': 0});
    }
    if (tariff['type'] == 'income') {
      this.cost += tariff['amount'];
      this.meterTariff[i].amount += tariff['amount'];
    } else {
      this.cost -= tariff['amount'];
      this.meterTariff[i].amount -= tariff['amount'];
    }
  }

  updateAmountFor() {
    if (this.startDate.isSame(Moment(), 'day') == true) {
      this.amountFor = 'today';
    } else {
      if (this.displayPeriod == 'DAY') {
        this.amountFor = this.startDate.format('Do MMM YYYY');
      } else {
        this.amountFor = this.displayPeriod.toLowerCase() + ' from ' + this.startDate.format('Do MMM YYYY');
      }
    }
  }
}
