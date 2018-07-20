import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {

  city = 'Unknown coordinates';

  constructor(private configService: ConfigService) {
    let latitude = configService.getConfigurationValue('latitude');
    let longitude = configService.getConfigurationValue('longitude');
    configService.getReverseGeolocation(latitude, longitude).pipe().subscribe(reverse => {
      try {
        this.city = reverse.results[0].address_components[0].long_name;
      } catch(e) {
        this.city = 'Location Not found';
      }
    });
  }

  ngOnInit() {
  }

}
