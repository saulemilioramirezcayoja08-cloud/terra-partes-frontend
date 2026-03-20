import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationCreate } from './quotation-create';

describe('QuotationCreate', () => {
  let component: QuotationCreate;
  let fixture: ComponentFixture<QuotationCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
