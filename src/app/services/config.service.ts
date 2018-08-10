import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {
  private googleReverseKey = 'AIzaSyCmixIjtQOBEuqleIAdPY7Yc536zFs77ss';
  private configuration: any = null;

  constructor(private http: HttpClient) {
  }

  load(): Promise<any> {
    const promise = new Promise((resolve, reject) =>
      //this.http.get('http://' + window.location.hostname + ':4040/config/configuration')
      this.http.get(environment.configURL)
      .pipe()
      .subscribe(config => {
          this.configuration = config;
          resolve();
        },error => {
          window.location.href = 'noconfig.html';
          resolve();
        })
      );
      return promise;
   }

  getReverseGeolocation(latitude, longitude): Observable<any> {
    // return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=postal_town&key=${this.googleReverseKey}`);
    return this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
  }

  getConfigurationValue(key) {
    return this.configuration[key];
  }

  getConfigurationPowerValues(power=null, key=null) {
    if (power == null) {
      return this.configuration.power;
    } else {
      let values = [];
      this.configuration.power.forEach(config => {
        if (config.type == power) {
          if (key == null || key == '') {
            values.push(config);
          } else {
            let value = config[key] || null;
            if (value != null) {
              values.push(value);
            }
          }
        }
      });
      return values;
    }
  }

  getPower(configKeys) {
    let result = {};
    let keys = Object.keys(configKeys);

    this.configuration.power.forEach((power, index) => {
      if (keys.includes(power.type)) {
        configKeys[power.type].forEach(key => {
          result[power[key].id] = {'type': power.type, 'module': power[key].module, 'key': key, 'index': index};
          if (power.meter.circuit) {
            result[power[key].id]['circuit'] = [];
            power.meter.circuit.forEach(circuit => {
              result[power[key].id]['circuit'].push(circuit);
            });
          }
        });
      }
    });
    return result;
  }
}
