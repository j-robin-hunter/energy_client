import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MeterReadingService } from '../../../services/meter-reading.service';
import { ConfigService } from '../../../services/config.service';
import { EventService } from '../../../services/event.service';import { registerLocaleData } from '@angular/common';
import { Subscription, Observable, timer } from 'rxjs';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es';
import * as LocaleCurrency from 'locale-currency';
import * as Moment from 'moment';
import * as chroma from 'chroma-js';

const TICK = 60000;
const savingText = {
  'grid': 'tariff related savings',
  'solar': 'solar PV savings',
  'wind': 'wind generated savings',
  'battery': 'battery storage savings'
};

@Component({
  selector: 'app-saving',
  templateUrl: './saving.component.html',
  styleUrls: ['./saving.component.scss']
})
export class SavingComponent implements OnInit {
  @ViewChild('echart') container: ElementRef;

  private transitionendSubscription: Subscription;
  private echartsInstance: any;
  private series = [];
  private startDate;
  private endDate;
  private displayPeriod;
  private currentTariffs = [];
  private compareTariffs = [];
  private savingsMade: any = {};
  private power;

  public periods = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
  public saving: number = 0;
  public savingsFor: string;
  public fowardDisabled: boolean = true;
  public selectedTab: number = 0;
  public currency = 'GBP';
  public locale = 'en-GB';
  public savingsMadeArray = [];
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

  constructor(private configService: ConfigService,
              private meterReadingService: MeterReadingService,
              private eventService: EventService) {

    this.configService.getConfigurationPowerValues('grid').forEach(grid => {
      grid.tariff.forEach(tariff => {
        if (tariff.type == 'expenditure') {
          tariff.rate.forEach(rate => {
            this.currentTariffs.push({'amount': rate.amount, 'start': rate.start.split(':').reduce((acc, time) => (60 * acc) + +time)});
            //if (rate.amount > this.maxTariff) {
            //  this.maxTariff = rate.amount;
            //}
          });
        }
      })
      if (grid['compare']) {
        grid.compare.rate.forEach(rate => {
            this.compareTariffs.push({'amount': rate.amount, 'start': rate.start.split(':').reduce((acc, time) => (60 * acc) + +time)});
        });
      }
    });
    this.currentTariffs.sort((a, b) => b.start - a.start);
    if (this.compareTariffs.length == 0) {
      this.compareTariffs = this.currentTariffs.map(obj => ({...obj}));
    } else {
      this.compareTariffs.sort((a, b) => b.start - a.start);
    }

    this.setInitialDates();

    registerLocaleData(localeEn);
    registerLocaleData(localeDe);
    registerLocaleData(localeFr);
    registerLocaleData(localeEs);

    this.locale = configService.getConfigurationValue('locale') || this.locale;
    this.currency = LocaleCurrency.getCurrency(this.locale.split('.')[0]);

    this.power = configService.getPower({
      'grid': ['meter'],
      'solar': ['meter'],
      'battery': ['meter'],
      'wind': ['meter'],
      'load': ['meter']
    });

    let legend = [];
    Object.keys(this.power).forEach(item => {
      if (this.power[item].type != 'load') {
        this.savingsMade[this.power[item].type] = {
          'name': item,
          'type': this.power[item].type,
          'saving': 0,
          'text': savingText[this.power[item].type]};
        legend.push({'name': item, 'icon': 'circle'});
        this.series.push({
          'type': 'bar',
          'name': item,
          'stack': 'one',
          'areaStyle' : {'opacity': 0.5},
          'showSymbol': false,
          'barWidth': '3',
          'data': []
        });
      }
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

  panStart(event) {

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
    let savings = {};
    let ids;
    let lastSavings;
    let lastTime;
    let accrurredSaving = 0;
    Object.keys(this.power).forEach(item => {
      if (ids) {
        ids += `,"${item}"`;
      } else {
        ids = `"${item}"`;
      }
      if (this.power[item].type != 'load') {
        this.savingsMade[this.power[item].type]['saving'] = 0;
      }
    });
    let seriesLookup = {};
    this.series.forEach((item, index) => {
      seriesLookup[item.name] = index;
      item.data = [];
    });
    this.meterReadingService.getMeterReadingsBetween(ids, this.startDate.valueOf(), this.endDate.valueOf()).subscribe(readings => {
      readings.data['meterReadingsBetween'].forEach(meter => {
        meter.forEach(reading => {
          let data = savings[reading.time] || {
            'grid': {'reading': 0 },
            'solar': {'reading': 0 },
            'battery': {'reading': 0 },
            'wind': {'reading': 0 },
            'load': {'reading': 0 }
          };
          data[this.power[reading.id].type].reading += reading.reading;
          savings[reading.time] = data;
        });
      });

      Object.keys(savings).sort().forEach((key) => {
        let time = Number(key);
        if (lastSavings) {
          let deltaTime = time - lastTime;
          let load = lastSavings['load'].reading;
          let currentTariff = this.getTariff(this.currentTariffs, lastTime);
          let compareTariff = this.getTariff(this.compareTariffs, lastTime);
          let kw = (load / 1000) * (deltaTime / 3600000);
          Object.keys(this.power).forEach(item => {
            let r = lastSavings[this.power[item].type].reading;
            if (this.power[item].type != 'load') {
              let percent = r > 0 ? (r / load > 1 ? 1.0 : r / load) : 0;
              let saving = 0;
              if (this.power[item].type == 'grid') {
                saving = kw * percent * (compareTariff - currentTariff);
              } else {
                saving = kw * percent *  currentTariff;
              }
              this.savingsMade[this.power[item].type].saving += saving;
              accrurredSaving += saving;
              this.series[seriesLookup[item]].data.push({'name': item, 'value':[time, saving]});
            }
          });
        }
        lastTime = time;
        lastSavings = savings[key];
      });
      this.updateSavingsFor();
      this.saving = accrurredSaving;

      this.savingsMadeArray = [];
      Object.keys(this.savingsMade).sort().forEach(entry => {
        this.savingsMadeArray.push({
          'name': this.savingsMade[entry].name,
          'type':  this.savingsMade[entry].type,
          'saving': this.savingsMade[entry].saving,
          'text': this.savingsMade[entry].text});
      });
      this.updateOptions = {
        xAxis: {
          min: this.startDate.valueOf() - 900000,
          max: this.endDate.valueOf()
        },
        series: this.series
      }
    });
  }

  getTariff(tariffs, time) {
    let amount = 0;
    tariffs.some(tariff => {
      amount = tariff.amount;
      return tariff.start < (time / 1000) % (24 * 60 * 60);
    });
    return amount;
  }

  updateSavingsFor() {
    if (this.startDate.isSame(Moment(), 'day') == true) {
      this.savingsFor = 'today';
    } else {
      if (this.displayPeriod == 'DAY') {
        this.savingsFor = this.startDate.format('Do MMM YYYY');
      } else {
        this.savingsFor = this.displayPeriod.toLowerCase() + ' from ' + this.startDate.format('Do MMM YYYY');
      }
    }
  }
}
