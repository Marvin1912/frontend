import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { VocabularyListComponent } from './vocabulary-list.component';
import { Flashcard } from '../../model/Flashcard';

describe('ListComponent', () => {
  let component: VocabularyListComponent;
  let fixture: ComponentFixture<VocabularyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabularyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter by deck id with two or more digits, not just the last digit', () => {
    const flashcardDeck2: Flashcard = {
      id: 1,
      deckId: 2,
      ankiId: null,
      front: 'front2',
      back: 'back2',
      description: '',
      updated: false
    };
    const flashcardDeck12: Flashcard = {
      id: 2,
      deckId: 12,
      ankiId: null,
      front: 'front12',
      back: 'back12',
      description: '',
      updated: false
    };

    component.flashcards.data = [flashcardDeck2, flashcardDeck12];
    component.flashcards.filter = 'deck#12';

    expect(component.flashcards.filteredData).toEqual([flashcardDeck12]);
    expect(component.flashcards.filteredData).not.toContain(flashcardDeck2);
  });
});
