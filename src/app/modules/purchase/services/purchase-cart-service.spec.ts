import { TestBed } from '@angular/core/testing';

import { PurchaseCartService } from './purchase-cart-service';

describe('PurchaseCartService', () => {
  let service: PurchaseCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
