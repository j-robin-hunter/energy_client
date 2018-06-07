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

import { MyDatePickerModule } from 'mydatepicker';

import { NgxEchartsModule } from 'ngx-echarts';

import { WeatherService } from './services/weather.service';
import { MeasurementsService } from './services/measurements.service';
import { ConfigService } from './services/config.service';
import { EventService } from './services/event.service';

import { WeatherPanelComponent } from './components/weather/weatherPanel.component';
import { ClockComponent } from './components/clock/clock.component';
import { WeatherComponent } from './components/weather/weather/weather.component';
import { CloudSolarForecastComponent } from './components/weather/cloud-solar-forecast/cloud-solar-forecast.component';
import { WindForecastComponent } from './components/weather/wind-forecast/wind-forecast.component';
import { SummaryComponent } from './components/power/summary/summary.component';
import { ProviderComponent } from './components/power/provider/provider.component';
import { ConsumerComponent } from './components/power/consumer/consumer.component';
import { SelfuseComponent } from './components/power/selfuse/selfuse.component';
import { CityComponent } from './components/city/city.component';
import { WhatusesComponent } from './components/power/whatuses/whatuses.component';

export function configServiceFactory(configService: ConfigService):
  Function {
    return () => configService.getConfig();
  }

@NgModule({
  declarations: [
    AppComponent,
    WeatherPanelComponent,
    ClockComponent,
    WeatherComponent,
    CloudSolarForecastComponent,
    WindForecastComponent,
    SummaryComponent,
    ProviderComponent,
    ConsumerComponent,
    SelfuseComponent,
    CityComponent,
    WhatusesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
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
    },
    EventService
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
