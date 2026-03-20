import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseComplete } from './purchase-complete';

describe('PurchaseComplete', () => {
  let component: PurchaseComplete;
  let fixture: ComponentFixture<PurchaseComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseComplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseComplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
