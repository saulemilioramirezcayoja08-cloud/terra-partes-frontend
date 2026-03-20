import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePreview } from './purchase-preview';

describe('PurchasePreview', () => {
  let component: PurchasePreview;
  let fixture: ComponentFixture<PurchasePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasePreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
