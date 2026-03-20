import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePayables } from './purchase-payables';

describe('PurchasePayables', () => {
  let component: PurchasePayables;
  let fixture: ComponentFixture<PurchasePayables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasePayables]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasePayables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
