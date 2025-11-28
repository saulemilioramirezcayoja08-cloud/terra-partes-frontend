import { TestBed } from '@angular/core/testing';

import { CommissionReportService } from './commission-report-service';

describe('CommissionReportService', () => {
  let service: CommissionReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
