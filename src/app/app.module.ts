import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BsDropdownModule, TypeaheadModule} from 'ngx-bootstrap';
import { AppComponent } from './app.component';
import {WordService} from './services/word.service';
import {UtilService} from './services/util.service';
import { LinkedInComponent } from './linked-in/linked-in.component';
import {MetadataService} from './services/metadata.service';
import {HttpClientModule} from '@angular/common/http';
import { CoreBaseComponent } from './core-base/core-base.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import { PublishComponent } from './publish/publish.component';

@NgModule({
  declarations: [
    AppComponent,
    LinkedInComponent,
    CoreBaseComponent,
    PublishComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
  ],
  providers: [WordService, UtilService, MetadataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
