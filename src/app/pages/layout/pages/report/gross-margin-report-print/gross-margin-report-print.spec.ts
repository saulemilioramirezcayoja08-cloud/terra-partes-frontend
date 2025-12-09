import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrossMarginReportPrint } from './gross-margin-report-print';

describe('GrossMarginReportPrint', () => {
  let component: GrossMarginReportPrint;
  let fixture: ComponentFixture<GrossMarginReportPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrossMarginReportPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrossMarginReportPrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
