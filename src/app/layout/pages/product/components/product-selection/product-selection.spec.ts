import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelection } from './product-selection';

describe('ProductSelection', () => {
  let component: ProductSelection;
  let fixture: ComponentFixture<ProductSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
