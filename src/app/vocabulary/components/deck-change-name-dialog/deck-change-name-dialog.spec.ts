import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckChangeNameDialog } from './deck-change-name-dialog';

describe('DeckChangeNameDialog', () => {
  let component: DeckChangeNameDialog;
  let fixture: ComponentFixture<DeckChangeNameDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckChangeNameDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeckChangeNameDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
