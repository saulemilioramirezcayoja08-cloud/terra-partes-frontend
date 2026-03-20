import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseConceptPreview } from './expense-concept-preview';

describe('ExpenseConceptPreview', () => {
  let component: ExpenseConceptPreview;
  let fixture: ComponentFixture<ExpenseConceptPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseConceptPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseConceptPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
