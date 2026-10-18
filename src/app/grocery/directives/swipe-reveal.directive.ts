import {Directive, ElementRef, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';

/** Horizontal movement in px after which a pointer gesture counts as a swipe, not a tap. */
const DRAG_THRESHOLD = 6;

/**
 * Swipe-to-reveal for touch and pen. Mouse pointers are ignored: on fine pointers the
 * action is shown inline in the row (see `.swipe-row` in grocery.scss).
 */
@Directive({
  selector: '[appSwipeReveal]',
  exportAs: 'appSwipeReveal'
})
export class SwipeRevealDirective {

  @Input() revealWidth = 132;
  @Output() openChange = new EventEmitter<boolean>();

  private readonly el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private startX = 0;
  private originX = 0;
  private currentX = 0;
  private dragging = false;
  private swiped = false;

  constructor() {
    // A swipe ends with a click on the content; swallow it so the row does not navigate.
    this.el.addEventListener('click', event => {
      if (!this.swiped) return;
      this.swiped = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse') return;
    this.dragging = true;
    this.swiped = false;
    this.originX = event.clientX;
    this.startX = event.clientX - this.currentX;
    this.el.style.transition = 'none';
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    if (Math.abs(event.clientX - this.originX) > DRAG_THRESHOLD) {
      this.swiped = true;
    }
    const x = event.clientX - this.startX;
    this.currentX = Math.min(0, Math.max(-this.revealWidth, x));
    this.el.style.transform = `translateX(${this.currentX}px)`;
  }

  @HostListener('pointerup')
  @HostListener('pointercancel')
  onPointerUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.style.transition = '';
    this.setOpen(this.currentX < -this.revealWidth / 3);
  }

  open(): void {
    this.setOpen(true);
  }

  close(): void {
    this.setOpen(false);
  }

  private setOpen(open: boolean): void {
    this.currentX = open ? -this.revealWidth : 0;
    this.el.style.transform = this.currentX ? `translateX(${this.currentX}px)` : '';
    this.openChange.emit(open);
  }
}
