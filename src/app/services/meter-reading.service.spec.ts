import { TestBed, inject } from '@angular/core/testing';

import { MeterReadingService } from './meter-reading.service';

describe('MeterReadingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeterReadingService]
    });
  });

  it('should be created', inject([MeterReadingService], (service: MeterReadingService) => {
    expect(service).toBeTruthy();
  }));
});
