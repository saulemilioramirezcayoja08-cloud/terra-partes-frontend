import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePrint } from './purchase-print';

describe('PurchasePrint', () => {
  let component: PurchasePrint;
  let fixture: ComponentFixture<PurchasePrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasePrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasePrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
