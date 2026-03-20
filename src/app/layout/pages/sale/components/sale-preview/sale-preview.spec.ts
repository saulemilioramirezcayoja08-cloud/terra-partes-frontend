import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePreview } from './sale-preview';

describe('SalePreview', () => {
  let component: SalePreview;
  let fixture: ComponentFixture<SalePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalePreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
