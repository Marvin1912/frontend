import {Directive, HostListener} from '@angular/core';

/**
 * Prevents mouse-wheel scrolling from silently changing the value of a focused
 * `<input type="number">`. When the input is focused and the user scrolls, the
 * browser would otherwise increment/decrement the value (a data-loss bug). This
 * blurs the input and stops the default wheel behaviour so the page scrolls
 * instead of mutating the field.
 */
@Directive({
  selector: 'input[type=number]'
})
export class NoWheelDirective {

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    const target = event.target as HTMLElement;
    if (document.activeElement === target) {
      event.preventDefault();
      target.blur();
    }
  }
}
