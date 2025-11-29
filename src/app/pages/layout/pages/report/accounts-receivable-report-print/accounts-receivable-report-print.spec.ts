import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReceivableReportPrint } from './accounts-receivable-report-print';

describe('AccountsReceivableReportPrint', () => {
  let component: AccountsReceivableReportPrint;
  let fixture: ComponentFixture<AccountsReceivableReportPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsReceivableReportPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsReceivableReportPrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
