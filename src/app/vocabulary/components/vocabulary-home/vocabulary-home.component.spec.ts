import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyHomeComponent } from './vocabulary-home.component';

describe('HomeComponent', () => {
  let component: VocabularyHomeComponent;
  let fixture: ComponentFixture<VocabularyHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabularyHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
