import { TestBed } from '@angular/core/testing';

import { AccountsReceivableReportService } from './accounts-receivable-report-service';

describe('AccountsReceivableReportService', () => {
  let service: AccountsReceivableReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsReceivableReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
