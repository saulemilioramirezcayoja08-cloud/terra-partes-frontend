import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleConfirmedReport } from './sale-confirmed-report';

describe('SaleConfirmedReport', () => {
  let component: SaleConfirmedReport;
  let fixture: ComponentFixture<SaleConfirmedReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleConfirmedReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleConfirmedReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
