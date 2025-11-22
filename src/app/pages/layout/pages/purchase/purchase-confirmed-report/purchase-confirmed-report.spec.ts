import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseConfirmedReport } from './purchase-confirmed-report';

describe('PurchaseConfirmedReport', () => {
  let component: PurchaseConfirmedReport;
  let fixture: ComponentFixture<PurchaseConfirmedReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseConfirmedReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseConfirmedReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
