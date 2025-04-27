import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowImageDialogComponent } from './show-image-dialog.component';

describe('ShowImageDialogComponent', () => {
  let component: ShowImageDialogComponent;
  let fixture: ComponentFixture<ShowImageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowImageDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
