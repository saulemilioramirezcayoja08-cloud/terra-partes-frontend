import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReprint } from './sale-reprint';

describe('SaleReprint', () => {
  let component: SaleReprint;
  let fixture: ComponentFixture<SaleReprint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleReprint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleReprint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
