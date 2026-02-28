import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckManagementDialog } from './deck-management-dialog';

describe('DeckManagementDialog', () => {
  let component: DeckManagementDialog;
  let fixture: ComponentFixture<DeckManagementDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckManagementDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeckManagementDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
