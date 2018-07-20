import { TestBed, inject } from '@angular/core/testing';

import { MeterTariffService } from './meter-tariff.service';

describe('MeterTariffService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeterTariffService]
    });
  });

  it('should be created', inject([MeterTariffService], (service: MeterTariffService) => {
    expect(service).toBeTruthy();
  }));
});
