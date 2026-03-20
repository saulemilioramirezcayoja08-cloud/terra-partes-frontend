import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleComplete } from './sale-complete';

describe('SaleComplete', () => {
  let component: SaleComplete;
  let fixture: ComponentFixture<SaleComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleComplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleComplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
