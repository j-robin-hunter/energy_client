import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import "rxjs/add/observable/of"
import 'rxjs/add/operator/switchMap';
import { timer } from 'rxjs/observable/timer';

const CACHE_TTL = 600000;

@Injectable()
export class WeatherService {
  coord: ICoord = {lat:52.2015252, lon: 0.3986641};
  openweathermap: string = 'http://api.openweathermap.org/data/2.5/';
  appid: string = '24615ee29fd6a8cc987377ef5669f8da';
  weatherSource: Subject<IWeather[]> = new Subject<IWeather[]>();
  weatherSource$ = this.weatherSource.asObservable();
  weatherCache: Array<IWeather> = new Array<IWeather>();
  tempUnitMetric: boolean = true;
  speedUnitMetric: boolean = true;

  constructor(private http: HttpClient) {
    const subscribe = timer(0, CACHE_TTL).subscribe(val => {
      this.weatherForecast(this.coord, 'metric').subscribe(result => {
        this.weatherSource.next(this.weatherCache);
      });
    });
  }

  weatherAPICall(coord: ICoord, units: string): Observable<any> {
    return this.http.get(this.openweathermap + 'weather' + '?lat=' + coord.lat + '&lon=' + coord.lon + '&appid=' + this.appid + '&units=' + units);
  }

  forecastAPICall(coord: ICoord, units: string): Observable<any> {
    return this.http.get(this.openweathermap + 'forecast' + '?lat=' + coord.lat + '&lon=' + coord.lon + '&appid=' + this.appid + '&units=' + units);
  }

  weatherForecast(coord: ICoord, units: string): Observable<IWeather[]> {
    // Called on a timer tick this function builds the weather cache which is used to reduce the number of
    // calls that need to be madfe to an external weather service like Open Weather, each of whcih cost money.
    // The weather cache is made dirty after it's TTL time after which a call to get the Open Weather data
    // weather is made. If this is the wsame weather as the exiting most recent entry in the weather cache no
    // further action is taken and the cache is left intact but made clean. If the weather has changed the cache
    // is cleared and also populated not only with the weather reading obtained but also the forecast for the
    // next five days, again from Open Weather
    let weather$ = Observable.of(this.weatherCache).switchMap((cache) => {
      return this.weatherAPICall(coord, units).switchMap((response) =>{
        if (this.weatherCache.length == 0 || this.weatherCache[0].when != response.dt) {
          this.weatherCache = [];
          this.weatherCache.push(this.mapResults(response.name, response));
          return this.forecastAPICall(coord, units).switchMap((response) => {
            response.list.forEach(forecast => {
              this.weatherCache.push(this.mapResults(this.weatherCache[0].where.city, forecast));
            });
            console.log('new weather data');
            return Observable.of(this.weatherCache);
          });
        } else {
          return Observable.of(this.weatherCache);
        }
      });
    });
    return weather$;
  }

  /**
  oldweatherForecast(coord: ICoord, units: string): Observable<IWeather[]> {
    // Called on a timer tick this function builds the weather cache which is used to reduce the number of
    // calls that need to be madfe to an external weather service like Open Weather, each of whcih cost money.
    // The weather cache is made dirty after it's TTL time after which a call to get the Open Weather data
    // weather is made. If this is the wsame weather as the exiting most recent entry in the weather cache no
    // further action is taken and the cache is left intact but made clean. If the weather has changed the cache
    // is cleared and also populated not only with the weather reading obtained but also the forecast for the
    // next five days, again from Open Weather
    let weather$ = Observable.of(this.weatherCache).switchMap((cache) => {
      if (this.weatherCacheDirty) {
        console.log('cache dirty');
        this.weatherCacheDirty = false;
        return this.weatherAPICall(coord, units).switchMap((response) =>{
          if (this.weatherCache.length == 0 || this.weatherCache[0].when != response.dt) {
            this.weatherCache = [];
            this.weatherCache.push(this.mapResults(response.name, response));
            return this.forecastAPICall(coord, units).switchMap((response) => {
              response.list.forEach(forecast => {
                this.weatherCache.push(this.mapResults(this.weatherCache[0].where, forecast));
              });
              console.log('after forecast ', this.weatherCache);
              this.weatherSource.next(this.weatherCache);
              return Observable.of(this.weatherCache);
            });
          } else {
            console.log('cache ', this.weatherCache);
            return Observable.of(this.weatherCache);
          }
        });
      } else {
        return Observable.of(this.weatherCache);
      }
    });
    return weather$;
  }
  **/

  mapResults(where: string, result): IWeather {
    // This function converst the data from Open Weather API calls to an internal less dense format that
    // remove many unwanted fields.
    const iconMap = {
      '01d': '0001',
      '01n': '0008',
      '02d': '0002',
      '02n': '0041',
      '03d': '0043',
      '03n': '0044',
      '04d': '0003',
      '04n': '0042',
      '09d': '0009',
      '09n': '0025',
      '10d': '0017',
      '10n': '0033',
      '11d': '0024',
      '11n': '0024',
      '13d': '0019',
      '13n': '0035',
      '50d': '0007',
      '50n': '0064'
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
      icon: iconMap[result.weather[0].icon],
      temp: <IValue>{
        value: (this.tempUnitMetric ? Math.round(result.main.temp): Math.round((result.main.temp) * 1.8 + 32)),
        unit: (this.tempUnitMetric ? String.fromCharCode(176) + "C" : String.fromCharCode(176) + "F")
      },
      speed: <IValue>{
        value: (this.speedUnitMetric ? Math.round(result.wind.speed * 3.6): Math.round(result.wind.speed - 2.23694)),
        unit: (this.speedUnitMetric ? 'kph' : 'mph')
      },
      direction: compass[Math.round(result.wind.deg/22.5)],
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
