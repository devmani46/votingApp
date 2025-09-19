import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideEchartsCore({ echarts: () => import('echarts') }),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
}).catch(err => console.error(err));
