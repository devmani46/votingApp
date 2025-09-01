import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { appConfig } from './app/app.config';


bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
}).catch(err => console.error(err));
