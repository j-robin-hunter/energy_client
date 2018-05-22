import { Component, OnInit } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';

@Component({
  selector: 'app-self',
  templateUrl: './self.component.html',
  styleUrls: ['./self.component.css']
})
export class SelfComponent implements OnInit {

  constructor(private measurementsService: MeasurementsService) {
  }

  ngOnInit() {
		this.measurementsService.measurementSource$.subscribe(measurements => this.refreshSuppyData(measurements));
	}

  refreshSuppyData(measurements) {
		measurements.subscribe(measurement => {
      console.log({
        'load': measurement.pload.value,
        'solar': measurement.ipv.value * measurement.vpv.value,
        'battery': measurement.ibattery.value * measurement.vbattery.value,
        'charging': (measurement.ibattery.value < 0 ? 'true' : 'false'),
        'exporting': (measurement.pgrid.value < 0 ? 'true' : 'false'),
        'self': 0,
        'soc': measurement.soc.value});
    });
  }
}
