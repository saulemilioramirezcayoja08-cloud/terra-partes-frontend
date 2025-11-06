import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationReprint } from './quotation-reprint';

describe('QuotationReprint', () => {
  let component: QuotationReprint;
  let fixture: ComponentFixture<QuotationReprint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationReprint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationReprint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
