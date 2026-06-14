import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { VocabularyHomeComponent } from './vocabulary-home.component';

describe('HomeComponent', () => {
  let component: VocabularyHomeComponent;
  let fixture: ComponentFixture<VocabularyHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyHomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
