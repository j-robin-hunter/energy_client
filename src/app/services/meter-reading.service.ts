import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, Subject, timer, of } from 'rxjs';

const TICK = 30000;

@Injectable()
export class MeterReadingService {
  meterReadingSource: Subject<any> = new Subject<any>();
  meterReadingSource$ = this.meterReadingSource.asObservable();

  constructor(private apollo: Apollo) {
		this.getRecentMeterReadings();
  }

	getRecentMeterReadings() {
		// Get measurements for past 24 hours.
		let from = new Date().getTime() - (1000*60*60*24);
		let query = `query MeterReadingsBetween {meterReadingsBetween(id:["*"] start:${from} end:0){time, module, id, unit, reading}}`;
		return this.apollo.query({query: gql(query), fetchPolicy: 'no-cache'})
		.pipe(response => {
			return response;
		}).subscribe(meterReadings => {
			this.meterReadingSource.next(meterReadings.data['meterReadingsBetween']);
      // Get meter reading every TICK value seconds after getting the first one 5
      // seconds after the program starts (in order to get lastest readings, if any, soon after
      // the UI has settled down)
			timer(0, TICK).subscribe(val => {
			  this.getLatestMeterReadings();
			});
		});
	}

  getLatestMeterReadings() {
		let query = `query MeterReadings {meterReading(id:["*"]){time, module, id, unit, reading}}`;
    return this.apollo.query({query: gql(query), fetchPolicy: 'no-cache'})
    .pipe(response => {
      return response;
    }).subscribe(meterReadings => {
			this.meterReadingSource.next(meterReadings.data['meterReading']);
		});
  }

  getMeterReadingsBetween(ids, from, to) {
    let query = `query MeterReadingsBetween {meterReadingsBetween(id:[${ids}] start:${from} end:0){time, module, id, unit, reading}}`;
    return this.apollo.query({query: gql(query), fetchPolicy: 'no-cache'});
  }
}
