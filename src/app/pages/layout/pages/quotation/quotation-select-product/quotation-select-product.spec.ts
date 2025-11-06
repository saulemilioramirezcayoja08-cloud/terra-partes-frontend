import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationSelectProduct } from './quotation-select-product';

describe('QuotationSelectProduct', () => {
  let component: QuotationSelectProduct;
  let fixture: ComponentFixture<QuotationSelectProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationSelectProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationSelectProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
