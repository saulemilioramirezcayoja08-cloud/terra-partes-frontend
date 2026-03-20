import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationPreview } from './quotation-preview';

describe('QuotationPreview', () => {
  let component: QuotationPreview;
  let fixture: ComponentFixture<QuotationPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
