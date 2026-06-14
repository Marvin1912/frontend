import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DeckManagementDialog } from './deck-management-dialog';
import { Deck } from '../../model/Deck';

describe('DeckManagementDialog', () => {
  let component: DeckManagementDialog;
  let fixture: ComponentFixture<DeckManagementDialog>;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  const deck: Deck = {id: 1, name: 'Old Name'};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckManagementDialog],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeckManagementDialog);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();

    httpMock.expectOne(req => req.url.endsWith('/vocabulary/decks') && req.method === 'GET').flush([deck]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update local deck state and show a success snackbar when the rename succeeds', () => {
    const snackBarSpy = spyOn(snackBar, 'open');

    (component as any).vocabularyService.updateDeck = jasmine.createSpy().and.callFake(() => {
      return {
        subscribe: (handlers: any) => handlers.next({body: {id: 1, name: 'New Name'}})
      };
    });

    (component as any).decks.set([deck]);

    const dialogRef = {afterClosed: () => ({subscribe: (cb: (v: string | undefined) => void) => cb('New Name')})};
    spyOn((component as any).dialog, 'open').and.returnValue(dialogRef);

    component.openDialog(deck);

    expect((component as any).decks()).toEqual([{id: 1, name: 'New Name'}]);
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toContain('changed to New Name');
  });

  it('should keep local deck state unchanged and show an error snackbar when the rename fails', () => {
    const snackBarSpy = spyOn(snackBar, 'open');

    (component as any).vocabularyService.updateDeck = jasmine.createSpy().and.callFake(() => {
      return {
        subscribe: (handlers: any) => handlers.error('boom')
      };
    });

    (component as any).decks.set([deck]);

    const dialogRef = {afterClosed: () => ({subscribe: (cb: (v: string | undefined) => void) => cb('New Name')})};
    spyOn((component as any).dialog, 'open').and.returnValue(dialogRef);

    component.openDialog(deck);

    expect((component as any).decks()).toEqual([deck]);
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toContain('failed');
  });
});
