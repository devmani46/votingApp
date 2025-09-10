import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideEchartsCore } from 'ngx-echarts';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideEchartsCore({ echarts: () => import('echarts') })
  ],
}).catch(err => console.error(err));
