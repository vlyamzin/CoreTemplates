import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {WordService} from './word.service';
import {contentControls} from '../content-control.config';

export interface IUserDataBasic {
  id: number;
  firstname: string;
  lastname: string;
  getName: Function;
}

export interface IUserData extends IUserDataBasic {
  email: string;
  skype: string;
  technologies: Array<string[]>;
  certifications: Array<string>;
  experience: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class CoreBaseService {

  constructor(private http: HttpClient,
              private wordService: WordService) { }

  public getUsers(keyword: string): Observable<IUserDataBasic[]> {
    return this.http.get(`${environment.api}/core-base/lookup?keyword=${keyword}`).pipe(
      map((response: Array<any>) => {
        return response.map(user => {
          return Object.assign({}, user, {
            getName: function () {
              return this.firstname + ' ' + this.lastname;
            }
          });
        });
      })
    );
  }

  public getUserById(id: string): Observable<IUserData> {
    return this.http.get<IUserData>(`${environment.api}/core-base/info`, { params: { id }})
      .pipe(
        tap((res: IUserData) => this.render(res))
      );
  }

  public async render (user: IUserData) {
    const context = await this.wordService.getContext();

    this.renderExperience(context, user.experience)
      .renderEmail(context, user.email)
      .renderSkype(context, user.skype)
      .renderTechnologies(context, user.technologies)
      .renderCertifications(context, user.certifications);

    await context.sync();

  }

  private renderExperience(context: Word.RequestContext, data: Array<string>): CoreBaseService {
    const contentControl = this.wordService.getControl(context, contentControls.experienceSummary);

    contentControl.clear();

    data.slice().reverse().forEach((item: string) => {
      contentControl.insertParagraph(item, Word.InsertLocation.start);
    });

    return this;
  }

  private renderCertifications(context: Word.RequestContext, data: Array<string>): CoreBaseService {
    const contentControl = this.wordService.getControl(context, contentControls.certifications);

    contentControl.clear();

    data.slice().reverse().forEach((item: string) => {
      contentControl.insertParagraph(item, Word.InsertLocation.start);
    });

    return this;
  }

  private renderTechnologies(context: Word.RequestContext, data: Array<string[]>): CoreBaseService {
    const contentControl = this.wordService.getControl(context, contentControls.technologies);
    const table = contentControl.tables.getFirst();

    data.forEach((group: string[], index) => {
      const cell = table.getCellOrNullObject(0, index);
      cell.body.insertText(group.join(', '), Word.InsertLocation.replace);
    });

    return this;
  }

  private renderEmail(context: Word.RequestContext, data: string): CoreBaseService {
    const contentControl = this.wordService.getControl(context, contentControls.email);
    contentControl.insertHtml(`<a href="mailto:${data}" 
            style="font-weight: bold; font-size: 12pt;">${data}</a>`, Word.InsertLocation.replace);

    return this;
  }

  private renderSkype(context: Word.RequestContext, data: string): CoreBaseService {
    const contentControl = this.wordService.getControl(context, contentControls.skype);
    contentControl.insertHtml(`Skype: <a href="skype:${data}?userinfo" 
            style="font-style: italic font-size: 10pt;">${data}</a>`, Word.InsertLocation.replace);

    return this;
  }
}
