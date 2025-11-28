import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionReportPrint } from './commission-report-print';

describe('CommissionReportPrint', () => {
  let component: CommissionReportPrint;
  let fixture: ComponentFixture<CommissionReportPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionReportPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionReportPrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
