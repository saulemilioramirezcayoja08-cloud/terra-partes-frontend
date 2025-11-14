import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmedList } from './order-confirmed-list';

describe('OrderConfirmedList', () => {
  let component: OrderConfirmedList;
  let fixture: ComponentFixture<OrderConfirmedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfirmedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
