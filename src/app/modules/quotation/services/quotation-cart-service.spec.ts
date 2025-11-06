import { TestBed } from '@angular/core/testing';

import { QuotationCartService } from './quotation-cart-service';

describe('QuotationCartService', () => {
  let service: QuotationCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuotationCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
