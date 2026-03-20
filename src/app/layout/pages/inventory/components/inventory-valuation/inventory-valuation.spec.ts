import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryValuation } from './inventory-valuation';

describe('InventoryValuation', () => {
  let component: InventoryValuation;
  let fixture: ComponentFixture<InventoryValuation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryValuation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryValuation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
