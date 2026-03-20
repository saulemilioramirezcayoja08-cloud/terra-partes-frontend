import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPreview } from './customer-preview';

describe('CustomerPreview', () => {
  let component: CustomerPreview;
  let fixture: ComponentFixture<CustomerPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
