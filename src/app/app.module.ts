import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { WeatherPanelComponent } from './components/weather/weatherPanel.component';

import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import * as FintTheme from 'fusioncharts/themes/fusioncharts.theme.fint';
import { FusionChartsModule } from 'angular4-fusioncharts';

import { WeatherService } from './services/weather.service';
import { ClockComponent } from './components/clock/clock.component';
import { WeatherComponent } from './components/weather/weather/weather.component';
import { EnisticPanelComponent } from './components/enistic/enisticPanel.component';
import { CloudSolarForecastComponent } from './components/weather/cloud-solar-forecast/cloud-solar-forecast.component';
import { WindForecastComponent } from './components/weather/wind-forecast/wind-forecast.component';


FusionChartsModule.fcRoot(FusionCharts, Charts, FintTheme);

@NgModule({
  declarations: [
    AppComponent,
    WeatherPanelComponent,
    ClockComponent,
    WeatherComponent,
    EnisticPanelComponent,
    CloudSolarForecastComponent,
    WindForecastComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FusionChartsModule
  ],
  providers: [
    WeatherService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
