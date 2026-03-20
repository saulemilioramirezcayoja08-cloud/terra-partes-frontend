import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePayment } from './purchase-payment';

describe('PurchasePayment', () => {
  let component: PurchasePayment;
  let fixture: ComponentFixture<PurchasePayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasePayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasePayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
