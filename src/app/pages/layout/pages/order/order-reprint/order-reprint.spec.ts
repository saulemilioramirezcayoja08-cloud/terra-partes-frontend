import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderReprint } from './order-reprint';

describe('OrderReprint', () => {
  let component: OrderReprint;
  let fixture: ComponentFixture<OrderReprint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderReprint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderReprint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
