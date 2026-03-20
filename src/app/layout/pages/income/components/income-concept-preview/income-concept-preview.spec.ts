import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeConceptPreview } from './income-concept-preview';

describe('IncomeConceptPreview', () => {
  let component: IncomeConceptPreview;
  let fixture: ComponentFixture<IncomeConceptPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeConceptPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeConceptPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
