import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleConfirmedList } from './sale-confirmed-list';

describe('SaleConfirmedList', () => {
  let component: SaleConfirmedList;
  let fixture: ComponentFixture<SaleConfirmedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleConfirmedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleConfirmedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
