import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DeckChangeNameDialog } from './deck-change-name-dialog';

describe('DeckChangeNameDialog', () => {
  let component: DeckChangeNameDialog;
  let fixture: ComponentFixture<DeckChangeNameDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckChangeNameDialog],
      providers: [{provide: MAT_DIALOG_DATA, useValue: {name: 'Deck'}}]
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
