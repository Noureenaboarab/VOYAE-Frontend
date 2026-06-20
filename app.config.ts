// ============================================================
// VOYÆ — App Config (Angular 17+ standalone bootstrap)
// ============================================================
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions(),        // smooth page transitions
      withComponentInputBinding()   // bind route params to @Input()
    ),
    provideHttpClient(withFetch()),
  ],
};
