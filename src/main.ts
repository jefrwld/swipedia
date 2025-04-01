import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import 'hammerjs';


bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(),    importProvidersFrom(BrowserAnimationsModule),] // Neuer Weg in Angular 19!
}).catch(err => console.error(err));

