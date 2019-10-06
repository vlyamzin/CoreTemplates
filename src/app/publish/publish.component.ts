import { Component, OnInit } from '@angular/core';
import {WordService} from '../services/word.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {MetadataService} from '../services/metadata.service';
import {UtilService} from '../services/util.service';
import {contentControls} from '../content-control.config';

type FileType = 'docx' | 'pdf';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  public pdf: boolean;
  public docx: boolean;

  constructor(private wordService: WordService,
              private http: HttpClient,
              private metadata: MetadataService,
              private util: UtilService) {
  }

  async ngOnInit() {
    // this.pdf = this.util.isTrue(await this.metadata.getItem('publishAsPdf'));
    // this.docx = this.util.isTrue(await this.metadata.getItem('publishAsDocx'));
    this.docx = true;
    this.pdf = true;
  }

  public async toggle(event, type: FileType) {
    switch (type) {
      case 'docx':
        this.docx = event.target.checked;
        await this.metadata.setItem('publishAsDocx', String(this.docx));
        break;
      case 'pdf':
        this.pdf = event.target.checked;
        await this.metadata.setItem('publishAsPdf', String(this.pdf));
        break;
    }
  }

  public async publish() {
    const filename = await this.getFileName();

    if (this.pdf) {
      this.sendFile(`${filename}_CV`, Office.FileType.Pdf);
    }

    if (this.docx) {
      this.sendFile(`${filename}_CV`, Office.FileType.Compressed);
    }
  }

  private async sendFile(filename: string, type: Office.FileType) {
    const file = await this.wordService.getDocument(type);
    const ext = type === Office.FileType.Pdf ? '.pdf' : '.docx';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', filename);
    formData.append('ext', type === Office.FileType.Pdf ? '.pdf' : '.docx');

    this.http.post(`${environment.api}/publish?name=${filename}&type=${ext}`, formData)
      .subscribe(res => console.log(res));
  }

  private async getFileName() {
    const context = await this.wordService.getContext();
    const contentControl = this.wordService.getControl(context, contentControls.userName);

    await contentControl.load('text');
    await context.sync();

    return contentControl.text.trim().replace(/\s/g, '_') || 'Test';
  }

}
