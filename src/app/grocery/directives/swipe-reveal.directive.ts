import {Directive, ElementRef, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';

@Directive({
  selector: '[appSwipeReveal]',
  exportAs: 'appSwipeReveal'
})
export class SwipeRevealDirective {

  @Input() revealWidth = 132;
  @Output() openChange = new EventEmitter<boolean>();

  private readonly el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private startX = 0;
  private currentX = 0;
  private dragging = false;

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.startX = event.clientX - this.currentX;
    this.el.style.transition = 'none';
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
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

  close(): void {
    this.setOpen(false);
  }

  private setOpen(open: boolean): void {
    this.currentX = open ? -this.revealWidth : 0;
    this.el.style.transform = `translateX(${this.currentX}px)`;
    this.openChange.emit(open);
  }
}
