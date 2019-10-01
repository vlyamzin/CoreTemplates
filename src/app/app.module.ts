import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BsDropdownModule} from 'ngx-bootstrap';
import { AppComponent } from './app.component';
import {WordService} from './services/word.service';
import {UtilService} from './services/util.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot()
  ],
  providers: [WordService, UtilService],
  bootstrap: [AppComponent]
})
export class AppModule { }
