import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReceivables } from './sale-receivables';

describe('SaleReceivables', () => {
  let component: SaleReceivables;
  let fixture: ComponentFixture<SaleReceivables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleReceivables]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleReceivables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
