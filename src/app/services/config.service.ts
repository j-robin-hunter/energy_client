import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {
  private googleReverseKey = 'AIzaSyBrED62CyrSGV5fyFXSkEnxZDO5X9kAwVU';
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
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=postal_town&key=${this.googleReverseKey}`);
  }

  getConfigurationValue(key) {
    return this.configuration[key];
  }

  getConfigurationItemValues(item=null, key=null) {
    if (item == null) {
      return this.configuration.item;
    } else {
      let values = [];
      this.configuration.item.forEach(config => {
        if (config.type == item) {
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

  getLookup(configKeys) {
    let result = {};
    let keys = Object.keys(configKeys);

    this.configuration.item.forEach((item, index) => {
      if (keys.includes(item.type)) {
        configKeys[item.type].forEach(key => {
          if (Array.isArray(item[key])) {
            item[key].forEach(entry => {
              result[entry.id] = {'type': item.type, 'source': entry.source, 'key': key, 'index': index};
            });
          } else {
            result[item[key].id] = {'type': item.type, 'source': item[key].source, 'key': key, 'index': index};
          }
        });
      }
    });
    return result;
  }
}
