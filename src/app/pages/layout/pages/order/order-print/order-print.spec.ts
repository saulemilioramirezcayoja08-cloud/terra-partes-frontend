import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPrint } from './order-print';

describe('OrderPrint', () => {
  let component: OrderPrint;
  let fixture: ComponentFixture<OrderPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
