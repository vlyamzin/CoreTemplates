import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {UtilService} from '../services/util.service';
import {MetadataService} from '../services/metadata.service';
import {HttpClient} from '@angular/common/http';
import {WordService} from '../services/word.service';
import {contentControls} from '../content-control.config';

@Component({
  selector: 'app-linked-in',
  templateUrl: './linked-in.component.html',
  styleUrls: ['./linked-in.component.scss']
})
export class LinkedInComponent implements OnInit {
  public state: boolean;
  private loginDialog: any;

  constructor(private utilService: UtilService,
              private wordService: WordService,
              private metadata: MetadataService,
              private http: HttpClient) { }

  async ngOnInit() {
    this.state = this.utilService.isTrue(await this.metadata.getItem('linkedin'));
  }

  public toggle($event): void {
    if ($event.target && $event.target.checked) {
      // this.showAuthDialog();
      this.loadInfo();
      this.changeState(true);
    } else {
      this.clear();
      this.changeState(false);
    }
  }

  private showAuthDialog(): void {
    Office.context.ui.displayDialogAsync(`${environment.host}/login.html`, {
      width: 30,
      height: 50
    }, (result: any) => {
      this.loginDialog = result.value;

      if (this.loginDialog) {
        this.loginDialog.addEventHandler(Office.EventType.DialogMessageReceived, this.processDialogMessage.bind(this));
      }
    });
  }

  private clear(): void {

  }

  private loadInfo(): void {
    this.http.get(`${environment.api}/li/profile`)
      .subscribe((data) => {
        console.log(data);
        this.renderInfo(data);
      });
  }

  private processDialogMessage(arg): void {
    if (arg.error) {
      this.changeState(false);
      return;
    }

    if (this.utilService.isTrue(arg.message.toLowerCase())) {
      this.changeState(true);
    } else {
      this.changeState(false);
    }
    this.loginDialog.close();
  }

  private changeState(newState: boolean): void {
    this.state = newState;
    this.metadata.setItem('linkedin', String(this.state));
  }

  private async renderInfo(data) {
    const context: Word.RequestContext = await this.wordService.getContext();
    const userNameCC = this.wordService.getControl(context, contentControls.userName);
    const photo = this.wordService.getControl(context, contentControls.photo);

    userNameCC.insertText(`${data.firstName} ${data.lastName}`, Word.InsertLocation.replace);
    photo.insertInlinePictureFromBase64(data.picture, Word.InsertLocation.replace);

    await context.sync();
  }

}
