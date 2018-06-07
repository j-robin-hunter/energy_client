import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, timer, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';

const CACHE_TTL = 600000;

@Injectable()
export class WeatherService {
  coord: ICoord;
  openweathermapURL: string;
  uriSuffix: string;
  weatherSource: Subject<IWeather[]> = new Subject<IWeather[]>();
  weatherSource$ = this.weatherSource.asObservable();
  lastWeather: number = 0;
  tempUnitMetric: boolean = true;
  speedUnitMetric: boolean = true;

  constructor(private http: HttpClient, private configService: ConfigService) {
    let appid: string = '24615ee29fd6a8cc987377ef5669f8da';
    this.openweathermapURL = 'http://api.openweathermap.org/data/2.5/';
    configService.getConfig().pipe().subscribe(config => {
      this.coord = {'lat': config['latitude'], 'lon': config['longitude']}
      this.uriSuffix = '?lat=' + this.coord.lat + '&lon=' + this.coord.lon + '&appid=' + appid + '&units=metric';
      const subscribe = timer(0, CACHE_TTL).subscribe(val => {
        this.weatherForecast();
      });
    });
  }

  weatherAPICall(type: string): Observable<any> {
    return this.http
      .get(this.openweathermapURL + type + this.uriSuffix);
  }

  weatherForecast() {
    // Called on a timer tick this function builds the weather cache which is used to reduce the number of
    // calls that need to be madfe to an external weather service like Open Weather, each of whcih cost money.
    // The weather cache is made dirty after it's TTL time after which a call to get the Open Weather data
    // weather is made. If this is the wsame weather as the exiting most recent entry in the weather cache no
    // further action is taken and the cache is left intact but made clean. If the weather has changed the cache
    // is cleared and also populated not only with the weather reading obtained but also the forecast for the
    // next five days, again from Open Weather
    this.weatherAPICall('weather').subscribe((wResponse) => {
      if (this.lastWeather != wResponse.dt) {
        this.lastWeather = wResponse.dt;
        this.weatherAPICall('forecast').pipe(
          map((fResponse) => {
            let forecast: Array<IWeather> = new Array<IWeather>();
            forecast.push(this.mapResults(wResponse.name, wResponse));
            fResponse.list.forEach(weather => forecast.push(this.mapResults(fResponse.city.name, weather)));
            return forecast;
          })
        ).subscribe(forecast => this.weatherSource.next(forecast));
      }
    });
  }

  mapResults(where: string, result): IWeather {
    // This function converst the data from Open Weather API calls to an internal less dense format that
    // remove many unwanted fields.
    const iconMap = {
      '200d': '0016', '200n': '0032',
      '201d': '0024', '201n': '0040',
      '202d': '0024', '202n': '0040',
      '210d': '0016', '210n': '0032',
      '211d': '0024', '211n': '0040',
      '212d': '0024', '212n': '0040',
      '221d': '0024', '221n': '0040',
      '230d': '0016', '230n': '0032',
      '231d': '0016', '231n': '0032',
      '232d': '0016', '232n': '0032',
      '300d': '0048', '300n': '0066',
      '301d': '0048', '301n': '0066',
      '302d': '0048', '302n': '0066',
      '310d': '0048', '310n': '0066',
      '311d': '0017', '311n': '0033',
      '312d': '0017', '312n': '0033',
      '313d': '0009', '313n': '0025',
      '314d': '0009', '314n': '0025',
      '321d': '0009', '321n': '0025',
      '500d': '0017', '500n': '0033',
      '501d': '0017', '501n': '0033',
      '502d': '0018', '502n': '0034',
      '503d': '0051', '503n': '0069',
      '504d': '0051', '504n': '0069',
      '511d': '0050', '511n': '0068',
      '520d': '0009', '520n': '0033',
      '521d': '0009', '521n': '0033',
      '522d': '0010', '522n': '0034',
      '531d': '0085', '531n': '0086',
      '600d': '0019', '600n': '0035',
      '601d': '0019', '601n': '0035',
      '602d': '0020', '602n': '0036',
      '611d': '0021', '611n': '0037',
      '612d': '0013', '612n': '0029',
      '615d': '0013', '615n': '0029',
      '616d': '0089', '616n': '0090',
      '620d': '0011', '620n': '0027',
      '621d': '0011', '621n': '0027',
      '622d': '0012', '622n': '0028',
      '701d': '0006', '701n': '0063',
      '711d': '0055', '711n': '0073',
      '721d': '0005', '721n': '0063',
      '731d': '0056', '731n': '0074',
      '741d': '0007', '741n': '0064',
      '751d': '0056', '751n': '0074',
      '761d': '0056', '761n': '0074',
      '762d': '0091', '762n': '0091',
      '771d': '0060', '771n': '0078',
      '781d': '0079', '781n': '0079',
      '800d': '0001', '800n': '0008',
      '801d': '0002', '801n': '0041',
      '802d': '0002', '802n': '0041',
      '803d': '0002', '803n': '0041',
      '804d': '0003', '804n': '0042',
      '900d': '0079', '900n': '0079',
      '901d': '0080', '901n': '0080',
      '902d': '0080', '902n': '0080',
      '903d': '0046', '903n': '0062',
      '904d': '0045', '904n': '0061',
      '905d': '0060', '905n': '0078',
      '906d': '0015', '906n': '0031',
      '951d': '0003', '951n': '0004',
      '952d': '0003', '952n': '0004',
      '953d': '0003', '953n': '0004',
      '954d': '0003', '954n': '0004',
      '955d': '0003', '955n': '0004',
      '956d': '0060', '956n': '0078',
      '957d': '0060', '957n': '0078',
      '958d': '0060', '958n': '0078',
      '959d': '0060', '959n': '0078',
      '960d': '0060', '960n': '0078',
      '961d': '0080', '961n': '0080',
      '962d': '0080', '962n': '0080'
    }

    const compass = [
      "northerly",
      "north north easterly",
      "north easterly",
      "east north easterly",
      "easterly",
      "east south easterly",
      "south easterly",
      "south south easterly",
      "southerly",
      "south south westerly",
      "south westerly",
      "west south westerly",
      "westerly",
      "west north westerly",
      "north westerly",
      "north north westerly"
    ]

    return <IWeather>{
      where: <IWhere>{
        city: where, lon: this.coord.lon, lat: this.coord.lat
      },
      when: result.dt,
      description: result.weather[0].description,
      icon: iconMap[String(result.weather[0].id) + result.weather[0].icon.charAt(2)],
      temp: <IValue>{
        value: (this.tempUnitMetric ? Math.round(result.main.temp): Math.round((result.main.temp) * 1.8 + 32)),
        unit: (this.tempUnitMetric ? String.fromCharCode(176) + "C" : String.fromCharCode(176) + "F")
      },
      speed: <IValue>{
        value: (this.speedUnitMetric ? Math.round(result.wind.speed * 3.6): Math.round(result.wind.speed - 2.23694)),
        unit: (this.speedUnitMetric ? 'kph' : 'mph')
      },
      direction: compass[Math.round(result.wind.deg/22.5) % 16],
      cloud: result.clouds.all,
      pressure: result.main.pressure,
      humidity: result.main.humidity
    }
  }
}

export interface ICoord {
  lat: number;
  lon: number;
}

export interface IWeather {
  where: IWhere;
  when: number;
  description: string;
  icon: string;
  temp: IValue;
  speed: IValue;
  direction: string;
  cloud: number;
  pressure: number;
  humidity: number;
}

export interface IWhere {
  city: string;
  lon: number;
  lat: number;
}

export interface IValue {
  value: number;
  unit: string;
}
