import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPreview } from './order-preview';

describe('OrderPreview', () => {
  let component: OrderPreview;
  let fixture: ComponentFixture<OrderPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
