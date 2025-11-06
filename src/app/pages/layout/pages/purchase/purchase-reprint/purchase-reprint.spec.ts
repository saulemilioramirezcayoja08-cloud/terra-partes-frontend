import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReprint } from './purchase-reprint';

describe('PurchaseReprint', () => {
  let component: PurchaseReprint;
  let fixture: ComponentFixture<PurchaseReprint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReprint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseReprint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
