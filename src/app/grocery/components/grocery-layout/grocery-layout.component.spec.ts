import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {GroceryLayoutComponent} from './grocery-layout.component';

@Component({template: ''})
class EmptyComponent {
}

describe('GroceryLayoutComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([
        {
          path: 'grocery',
          component: GroceryLayoutComponent,
          children: [
            {path: '', component: EmptyComponent, data: {home: '/'}},
            {path: 'receipts', component: EmptyComponent, data: {home: '/grocery'}},
            {path: 'categories', component: EmptyComponent, data: {home: '/grocery'}}
          ]
        }
      ])]
    });
  });

  async function navigate(url: string): Promise<GroceryLayoutComponent> {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(GroceryLayoutComponent);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('takes the home link from the route data', async () => {
    expect((await navigate('/grocery/receipts')).homeLink()).toBe('/grocery');
  });

  it('falls back to the app root on the grocery start page', async () => {
    expect((await navigate('/grocery')).homeLink()).toBe('/');
  });

  it('keeps "Mehr" active on views reached from it', async () => {
    expect((await navigate('/grocery/categories')).moreActive()).toBe(true);
  });

  it('does not mark "Mehr" active elsewhere', async () => {
    expect((await navigate('/grocery/receipts')).moreActive()).toBe(false);
  });
});
