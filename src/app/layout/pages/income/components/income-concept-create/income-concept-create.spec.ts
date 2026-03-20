import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeConceptCreate } from './income-concept-create';

describe('IncomeConceptCreate', () => {
  let component: IncomeConceptCreate;
  let fixture: ComponentFixture<IncomeConceptCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeConceptCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeConceptCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
