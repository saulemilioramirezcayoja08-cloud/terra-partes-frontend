import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSelectProduct } from './order-select-product';

describe('OrderSelectProduct', () => {
  let component: OrderSelectProduct;
  let fixture: ComponentFixture<OrderSelectProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSelectProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderSelectProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
