import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class MeterTariffService {

  constructor(private apollo: Apollo, private configService: ConfigService) {
  }

  getMeterTariffsBetween(start, end): Observable<ApolloQueryResult<{}>> {
  	let query = `query MeterTariffBetween {meterTariffBetween (id:"*" start:${start} end:${end}){time, amount, tariff, tax, type, name, rateid}}`
  	return this.apollo.query({query: gql(query), fetchPolicy: 'no-cache'});
  }

  getLatestMeterTariffs(): Observable<ApolloQueryResult<{}>> {
    let query = `query MeterTariff {meterTariff(id:"*"){amount, tariff, tax, type, name, rateid}}`;
  	return this.apollo.query({query: gql(query), fetchPolicy: 'no-cache'});
  }

  getTariffs() {
    return this.configService.getConfigurationValue('tariff');
  }
}
