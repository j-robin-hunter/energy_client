import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {

  city = 'Unknown coordinates';

  constructor(private configService: ConfigService) {
    configService.getConfig().pipe().subscribe(config => {
      configService.getReverseGeolocation(config['latitude'], config['longitude']).pipe().subscribe(reverse => {
        try {
          this.city = reverse['results'][0]['address_components'][0]['long_name'];
        } catch(e) {
          this.city = 'Location Not found';
        }
      });
    });
  }

  ngOnInit() {}

}
