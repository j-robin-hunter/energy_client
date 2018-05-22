import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable ,  Subject ,  timer } from 'rxjs';
import "rxjs/add/observable/of"

const TICK = 10000;
const LatestMeasurements = gql`
query LatestMeasurements {
	pgrid:measurement(id: PGRID) {
    value
  }
  pload:measurement(id: LOAD_POWER) {
    value
  }
  ibattery:measurement(id: IBATTERY1) {
    value
  }
  vbattery:measurement(id: VBATTERY1) {
    value
  }
  total_load:measurement(id: E_TOTAL_LOAD) {
    value
  }
  pmeter:measurement(id: PMETER) {
    value
  }
  vpv:measurement(id: VPV1) {
    value
  }
  ipv:measurement(id: IPV1) {
    value
  }
  pvtotal:measurement(id:PVTOTAL) {
    value
  }
	soc:measurement(id: SOC1) {
		value
	}
	washing_machines:measurement(id: WASHING_MACHINES) {
		value
	}
	water_heater:measurement(id: WATER_HEATER) {
		value
	}
	kitchen_island:measurement(id: KITCHEN_ISLAND) {
		value
	}
	ovens:measurement(id: OVENS) {
		value
	}
	upsairs_power:measurement(id: UPSTAIRS_POWER) {
		value
	}
	kitchen_power:measurement(id: KITCHEN_POWER) {
		value
	}
	over_garage_power:measurement(id: OVER_GARAGE_POWER) {
		value
	}
	downstairs_power:measurement(id: DOWNSTAIRS_POWER) {
		value
	}
	living_room_and_dmx:measurement(id: LIVING_ROOM_AND_DMX) {
		value
	}
	lighting:measurement(id: LIGHTING) {
		value
	}
	evolution:measurement(id: EVOLUTION) {
		value
	}
}
`;

@Injectable()
export class MeasurementsService {
  measurementSource: Subject<any> = new Subject<any>();
  measurementSource$ = this.measurementSource.asObservable();

  constructor(private apollo: Apollo) {
    const subscribe = timer(0, TICK).subscribe(val => {
      this.measurementSource.next(this.getLatestMeasurements());
    });
  }

  getLatestMeasurements(): Observable<any> {
    return this.apollo.query({query: LatestMeasurements, fetchPolicy: 'no-cache'})
    .pipe(response => {
			console.log('A response', response);
      return response;
    });
  }
}
