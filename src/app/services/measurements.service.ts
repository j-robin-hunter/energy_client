import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, Subject, timer, of } from 'rxjs';

const TICK = 30000;
const LatestMeasurements = gql`
query LatestMeasurements {
	pgrid:measurement(id: PGRID) {
    value,
		time,
		id
  }
  pload:measurement(id: LOAD_POWER) {
    value,
		time,
		id
  }
	vload:measurement(id: VLOAD) {
    value,
		time,
		id
  }
  ibattery:measurement(id: IBATTERY1) {
    value,
		time,
		id
  }
  vbattery:measurement(id: VBATTERY1) {
    value,
		time,
		id
  }
  total_load:measurement(id: E_TOTAL_LOAD) {
    value,
		time,
		id
  }
  pmeter:measurement(id: PMETER) {
    value,
		time,
		id
  }
  vpv:measurement(id: VPV1) {
    value,
		time,
		id
  }
  ipv:measurement(id: IPV1) {
    value,
		time,
		id
  }
  pvtotal:measurement(id:PVTOTAL) {
    value,
		time,
		id
  }
	soc:measurement(id: SOC1) {
		value,
		time,
		id
	}
	soh:measurement(id: SOH1) {
		value,
		time,
		id
	}
	washing_machines:measurement(id: WASHING_MACHINES) {
		value,
		time,
		id
	}
	water_heater:measurement(id: WATER_HEATER) {
		value,
		time,
		id
	}
	kitchen_island:measurement(id: KITCHEN_ISLAND) {
		value,
		time,
		id
	}
	ovens:measurement(id: OVENS) {
		value,
		time,
		id
	}
	upstairs_power:measurement(id: UPSTAIRS_POWER) {
		value,
		time,
		id
	}
	kitchen_power:measurement(id: KITCHEN_POWER) {
		value,
		time,
		id
	}
	over_garage_power:measurement(id: OVER_GARAGE_POWER) {
		value,
		time,
		id
	}
	downstairs_power:measurement(id: DOWNSTAIRS_POWER) {
		value,
		time,
		id
	}
	living_room_and_dmx:measurement(id: LIVING_ROOM_AND_DMX) {
		value,
		time,
		id
	}
	lighting:measurement(id: LIGHTING) {
		value,
		time,
		id
	}
	evolution:measurement(id: EVOLUTION) {
		value,
		time,
		id
	}
}
`;

@Injectable()
export class MeasurementsService {
  measurementSource: Subject<any> = new Subject<any>();
  measurementSource$ = this.measurementSource.asObservable();

  constructor(private apollo: Apollo) {
    const subscribe = timer(0, TICK).subscribe(val => {
      this.getLatestMeasurements();
    });
  }

  getLatestMeasurements() {
    return this.apollo.query({query: LatestMeasurements, fetchPolicy: 'no-cache'})
    .pipe(response => {
      return response;
    }).subscribe(measurements => this.measurementSource.next(measurements));
  }
}
