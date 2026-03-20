import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPreview } from './supplier-preview';

describe('SupplierPreview', () => {
  let component: SupplierPreview;
  let fixture: ComponentFixture<SupplierPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
