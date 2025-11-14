import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseConfirmedList } from './purchase-confirmed-list';

describe('PurchaseConfirmedList', () => {
  let component: PurchaseConfirmedList;
  let fixture: ComponentFixture<PurchaseConfirmedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseConfirmedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseConfirmedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
