import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierCreate } from './supplier-create';

describe('SupplierCreate', () => {
  let component: SupplierCreate;
  let fixture: ComponentFixture<SupplierCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
