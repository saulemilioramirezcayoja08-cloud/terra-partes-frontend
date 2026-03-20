import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomePreview } from './income-preview';

describe('IncomePreview', () => {
  let component: IncomePreview;
  let fixture: ComponentFixture<IncomePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomePreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
