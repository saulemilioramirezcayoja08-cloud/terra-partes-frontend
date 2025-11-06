import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSelectProduct } from './purchase-select-product';

describe('PurchaseSelectProduct', () => {
  let component: PurchaseSelectProduct;
  let fixture: ComponentFixture<PurchaseSelectProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseSelectProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseSelectProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
