import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePayment } from './sale-payment';

describe('SalePayment', () => {
  let component: SalePayment;
  let fixture: ComponentFixture<SalePayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalePayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalePayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
