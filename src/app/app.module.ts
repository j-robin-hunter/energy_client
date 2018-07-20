import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http'
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { NgxEchartsModule } from 'ngx-echarts';

import { WeatherService } from './services/weather.service';
import { MeterReadingService } from './services/meter-reading.service';
import { MeterTariffService } from './services/meter-tariff.service';
import { ConfigService } from './services/config.service';
import { EventService } from './services/event.service';

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
import { ToastComponent } from './components/toast/toast.component';
import { CostComponent } from './components/power/cost/cost.component';
import { SummaryLayoutComponent } from './layouts/summary-layout/summary-layout.component';
import { SocPipe } from './pipes/soc.pipe';

export function configServiceFactory(configService: ConfigService):
  Function {
    return () => configService.load();
  }

@NgModule({
  declarations: [
    AppComponent,
    ClockComponent,
    WeatherComponent,
    CloudSolarForecastComponent,
    WindForecastComponent,
    SummaryComponent,
    ProviderComponent,
    ConsumerComponent,
    SelfuseComponent,
    CityComponent,
    WhatusesComponent,
    ToastComponent,
    CostComponent,
    SummaryLayoutComponent,
    SocPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    NgxEchartsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [
    WeatherService,
    MeterReadingService,
    MeterTariffService,
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
  constructor(apollo: Apollo, httpLink: HttpLink, config: ConfigService, matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    apollo.create({
      link: httpLink.create({uri: environment.graphqlURL}),
      cache: new InMemoryCache()
    });
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/fonts/mdi.svg'));
    matIconRegistry.addSvgIcon('grid', domSanitizer.bypassSecurityTrustResourceUrl('./assets/fonts/grid.svg'));
    matIconRegistry.addSvgIcon('grid-export', domSanitizer.bypassSecurityTrustResourceUrl('./assets/fonts/grid-export.svg'));
  }
}
