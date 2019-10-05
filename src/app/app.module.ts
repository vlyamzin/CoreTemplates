import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BsDropdownModule} from 'ngx-bootstrap';
import { AppComponent } from './app.component';
import {WordService} from './services/word.service';
import {UtilService} from './services/util.service';
import { LinkedInComponent } from './linked-in/linked-in.component';
import {MetadataService} from './services/metadata.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LinkedInComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BsDropdownModule.forRoot()
  ],
  providers: [WordService, UtilService, MetadataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
