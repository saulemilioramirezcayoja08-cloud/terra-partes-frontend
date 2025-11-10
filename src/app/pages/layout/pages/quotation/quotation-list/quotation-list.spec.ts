import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationList } from './quotation-list';

describe('QuotationList', () => {
  let component: QuotationList;
  let fixture: ComponentFixture<QuotationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
