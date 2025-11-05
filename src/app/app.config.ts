import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {errorInterceptor} from './core/interceptors/error.interceptor';
import {ngrokInterceptor} from './core/interceptors/ngrok.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch(),
      withInterceptors([ngrokInterceptor, errorInterceptor])
    )
  ]
};
