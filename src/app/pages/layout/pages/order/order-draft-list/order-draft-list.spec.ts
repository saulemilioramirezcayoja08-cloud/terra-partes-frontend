import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDraftList } from './order-draft-list';

describe('OrderDraftList', () => {
  let component: OrderDraftList;
  let fixture: ComponentFixture<OrderDraftList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDraftList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDraftList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
