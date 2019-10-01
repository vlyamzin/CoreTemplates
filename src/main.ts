/// <reference types="@types/office-js" />
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

Office.initialize = () => {
  OfficeExtension.config.extendedErrorLogging = true;
  const officeLoaded = document.createEvent('Event');
  officeLoaded.initEvent('officeLoaded', true, true);
  platformBrowserDynamic().bootstrapModule(AppModule)
    .then(() => document.dispatchEvent(officeLoaded))
    .catch(err => console.log(err));
};

// setTimeout(() => {
//   const officeLoaded = document.createEvent('officeLoaded');
//   platformBrowserDynamic().bootstrapModule(AppModule)
//     .then(() => document.dispatchEvent(officeLoaded))
//     .catch(err => console.log(err));
// }, 0);
