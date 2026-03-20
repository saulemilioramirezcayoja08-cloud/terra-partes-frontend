import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleProfit } from './sale-profit';

describe('SaleProfit', () => {
  let component: SaleProfit;
  let fixture: ComponentFixture<SaleProfit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleProfit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleProfit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
