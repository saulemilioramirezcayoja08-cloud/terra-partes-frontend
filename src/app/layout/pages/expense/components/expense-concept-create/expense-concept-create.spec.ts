import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseConceptCreate } from './expense-concept-create';

describe('ExpenseConceptCreate', () => {
  let component: ExpenseConceptCreate;
  let fixture: ComponentFixture<ExpenseConceptCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseConceptCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseConceptCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
