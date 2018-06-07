import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ConfigService {
  googleReverseKey = 'AIzaSyBrED62CyrSGV5fyFXSkEnxZDO5X9kAwVU';

  constructor(private http: HttpClient) {
  }

  getConfig(): Observable<any> {
    return this.http.get('http://localhost:4040/config');
  }

  getReverseGeolocation(latitude, longitude): Observable<any> {
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=postal_town&key=${this.googleReverseKey}`);
  }
}
