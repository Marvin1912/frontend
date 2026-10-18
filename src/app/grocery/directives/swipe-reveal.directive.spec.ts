import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SwipeRevealDirective} from './swipe-reveal.directive';

@Component({
  imports: [SwipeRevealDirective],
  template: `<div appSwipeReveal [revealWidth]="72" (click)="clicks = clicks + 1"></div>`
})
class HostComponent {
  clicks = 0;
}

function pointer(type: string, clientX: number, pointerType = 'touch'): Event {
  const event = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(event, {clientX, pointerType});
  return event;
}

describe('SwipeRevealDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('div');
  });

  function swipe(from: number, to: number, pointerType = 'touch'): void {
    el.dispatchEvent(pointer('pointerdown', from, pointerType));
    el.dispatchEvent(pointer('pointermove', to, pointerType));
    el.dispatchEvent(pointer('pointerup', to, pointerType));
  }

  it('opens when swiped left past a third of the reveal width', () => {
    swipe(200, 140);
    expect(el.style.transform).toBe('translateX(-72px)');
  });

  it('snaps back on a short swipe', () => {
    swipe(200, 190);
    expect(el.style.transform).toBe('');
  });

  it('ignores mouse pointers, the action is inline there', () => {
    swipe(200, 100, 'mouse');
    expect(el.style.transform).toBe('');
  });

  it('swallows the click that ends a swipe, but not a tap', () => {
    swipe(200, 140);
    el.click();
    expect(fixture.componentInstance.clicks).toBe(0);

    swipe(140, 140);
    el.click();
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('opens and closes programmatically', () => {
    const directive = fixture.debugElement.children[0].injector.get(SwipeRevealDirective);
    directive.open();
    expect(el.style.transform).toBe('translateX(-72px)');
    directive.close();
    expect(el.style.transform).toBe('');
  });
});
