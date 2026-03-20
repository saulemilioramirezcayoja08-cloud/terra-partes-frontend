import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePrint } from './sale-print';

describe('SalePrint', () => {
  let component: SalePrint;
  let fixture: ComponentFixture<SalePrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalePrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalePrint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
