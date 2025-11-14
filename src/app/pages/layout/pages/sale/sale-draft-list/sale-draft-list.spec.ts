import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleDraftList } from './sale-draft-list';

describe('SaleDraftList', () => {
  let component: SaleDraftList;
  let fixture: ComponentFixture<SaleDraftList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleDraftList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleDraftList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
