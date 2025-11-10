import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCreate } from './customer-create';

describe('CustomerCreate', () => {
  let component: CustomerCreate;
  let fixture: ComponentFixture<CustomerCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
