import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleProfitTraceability } from './sale-profit-traceability';

describe('SaleProfitTraceability', () => {
  let component: SaleProfitTraceability;
  let fixture: ComponentFixture<SaleProfitTraceability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleProfitTraceability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleProfitTraceability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
