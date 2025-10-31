import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
  animation,
  useAnimation,
  query,
  stagger,
  group,
  animateChild
} from '@angular/animations';

// Fade in/out animations
export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

// Slide in from bottom
export const slideInUp = trigger('slideInUp', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in',
      style({ transform: 'translateY(100%)', opacity: 0 }))
  ])
]);

// Slide in from right
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in',
      style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

// Scale animation for cards
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ transform: 'scale(0.8)', opacity: 0 }))
  ])
]);

// Pulse animation for feedback
export const pulse = trigger('pulse', [
  transition('void => *', [
    animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.1)', offset: 0.5 }),
        style({ transform: 'scale(1)', offset: 1 })
      ]))
  ])
]);

// Shake animation for errors
export const shake = trigger('shake', [
  transition('void => *', [
    animate('500ms cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateX(-10px)', offset: 0.1 }),
        style({ transform: 'translateX(10px)', offset: 0.2 }),
        style({ transform: 'translateX(-10px)', offset: 0.3 }),
        style({ transform: 'translateX(10px)', offset: 0.4 }),
        style({ transform: 'translateX(-10px)', offset: 0.5 }),
        style({ transform: 'translateX(10px)', offset: 0.6 }),
        style({ transform: 'translateX(0)', offset: 1 })
      ]))
  ])
]);

// Loading spinner animation
export const rotate = trigger('rotate', [
  transition(':enter', [
    style({ transform: 'rotate(0deg)' }),
    animate('2000ms linear infinite',
      style({ transform: 'rotate(360deg)' }))
  ])
]);

// Progress bar animation
export const progressGrow = trigger('progressGrow', [
  transition(':enter', [
    style({ width: '0%' }),
    animate('800ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ width: '*' }))
  ])
]);

// Number pad button press animation
export const buttonPress = trigger('buttonPress', [
  transition('active => inactive', [
    style({ transform: 'scale(0.95)' }),
    animate('100ms ease-out', style({ transform: 'scale(1)' }))
  ])
]);

// Stagger animation for lists
export const staggerChildren = trigger('staggerChildren', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('100ms', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

// Bounce animation for correct answers
export const bounce = trigger('bounce', [
  transition('void => *', [
    animate('800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      keyframes([
        style({ transform: 'translateY(0)', offset: 0 }),
        style({ transform: 'translateY(-20px)', offset: 0.2 }),
        style({ transform: 'translateY(0)', offset: 0.4 }),
        style({ transform: 'translateY(-10px)', offset: 0.6 }),
        style({ transform: 'translateY(0)', offset: 0.8 }),
        style({ transform: 'translateY(-5px)', offset: 0.9 }),
        style({ transform: 'translateY(0)', offset: 1 })
      ]))
  ])
]);

// Heartbeat animation for timer warning
export const heartbeat = trigger('heartbeat', [
  transition('* => warning', [
    animate('800ms ease-in-out',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.1)', offset: 0.14 }),
        style({ transform: 'scale(1)', offset: 0.28 }),
        style({ transform: 'scale(1.1)', offset: 0.42 }),
        style({ transform: 'scale(1)', offset: 0.7 })
      ]))
  ])
]);

// Reusable animation functions
export const fadeInAnimation = animation([
  style({ opacity: 0 }),
  animate('{{ duration }} {{ easing }}', style({ opacity: 1 }))
], { params: { duration: '300ms', easing: 'ease-in' } });

export const slideInAnimation = animation([
  style({ transform: 'translateX(-100%)' }),
  animate('{{ duration }} {{ easing }}', style({ transform: 'translateX(0)' }))
], { params: { duration: '400ms', easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' } });

export const scaleAnimation = animation([
  style({ transform: 'scale(0.3)', opacity: 0 }),
  animate('{{ duration }} {{ easing }}',
    style({ transform: 'scale(1)', opacity: 1 }))
], { params: { duration: '300ms', easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' } });

// Route transition animations
export const routeTransitionAnimations = [
  trigger('routeAnimations', [
    transition('SettingsPage <=> SessionPage', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          height: '100%'
        })
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(100%)' })
      ], { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease-out',
            style({ transform: 'translateX(-100%)' }))
        ], { optional: true }),
        query(':enter', [
          animate('300ms ease-out',
            style({ transform: 'translateX(0)' }))
        ], { optional: true })
      ])
    ]),
    transition('SessionPage <=> ListPage', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          height: '100%'
        })
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateY(100%)' })
      ], { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease-out',
            style({ transform: 'translateY(-100%)' }))
        ], { optional: true }),
        query(':enter', [
          animate('300ms ease-out',
            style({ transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ])
];