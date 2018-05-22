import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http'

import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import * as FintTheme from 'fusioncharts/themes/fusioncharts.theme.fint';
import { FusionChartsModule } from 'angular4-fusioncharts';

import { MyDatePickerModule } from 'mydatepicker';

import { NgxEchartsModule } from 'ngx-echarts';

import { WeatherService } from './services/weather.service';
import { MeasurementsService } from './services/measurements.service';
import { ConfigService } from './services/config.service';

import { WeatherPanelComponent } from './components/weather/weatherPanel.component';
import { ClockComponent } from './components/clock/clock.component';
import { WeatherComponent } from './components/weather/weather/weather.component';
import { CloudSolarForecastComponent } from './components/weather/cloud-solar-forecast/cloud-solar-forecast.component';
import { WindForecastComponent } from './components/weather/wind-forecast/wind-forecast.component';
import { SupplyComponent } from './components/power/supply/supply.component';
import { ConsumptionComponent } from './components/power/consumption/consumption.component';
import { SelfComponent } from './components/power/self/self.component';
import { WhatComponent } from './components/power/what/what.component';

FusionChartsModule.fcRoot(FusionCharts, Charts, FintTheme);

export function configServiceFactory(configService: ConfigService):
  Function {
    return () => configService.load();
  }

@NgModule({
  declarations: [
    AppComponent,
    WeatherPanelComponent,
    ClockComponent,
    WeatherComponent,
    CloudSolarForecastComponent,
    WindForecastComponent,
    SupplyComponent,
    ConsumptionComponent,
    SelfComponent,
    WhatComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    FusionChartsModule,
    MyDatePickerModule,
    NgxEchartsModule
  ],
  providers: [
    WeatherService,
    MeasurementsService,
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configServiceFactory,
      deps: [ConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(apollo: Apollo, httpLink: HttpLink, config: ConfigService) {
    apollo.create({
      link: httpLink.create({uri: environment.graphqlURL}),
      cache: new InMemoryCache()
    });
  }
}
