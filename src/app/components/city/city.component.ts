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
        if (reverse.address.hamlet) {
          this.city = reverse.address.hamlet;
        } else if (reverse.address.village) {
          this.city = reverse.address.village;
        } else if (reverse.address.town) {
          this.city = reverse.address.town;
        } else if (reverse.address.city) {
          this.city = reverse.address.city;
        }
      } catch(e) {
        this.city = 'Location Not found';
      }
    });
  }

  ngOnInit() {
  }

}
