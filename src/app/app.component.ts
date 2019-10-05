import {Component} from '@angular/core';
import {WordService} from './services/word.service';
import * as headerLogo from '!raw-loader!../assets/images/base64/header-logo.txt';
import * as footerLogo from '!raw-loader!../assets/images/base64/footer-logo.txt';
import {UtilService} from './services/util.service';
import {contentControls} from './content-control.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly normalParagraph: Word.Interfaces.ParagraphUpdateData;
  private readonly titleParagraph: Word.Interfaces.ParagraphUpdateData;
  private loginDialog: any;

  constructor(private wordService: WordService, private utilService: UtilService) {
    this.normalParagraph = {
      font: {
        size: 10,
        bold: false,
        name: 'Segoe UI'
      }
    };
    this.titleParagraph = Object.assign({}, this.normalParagraph, {
      font: { size: 11, bold: true},
      lineSpacing: 16
    });
  }

  public async generateTemplate(): Promise<void> {
    const ctx = await this.wordService.getContext();

    ctx.document.body.clear();
    ctx.document.body.set({font: { size: 10, name: 'Segoe UI'}});

    await this.populateHeader(ctx)
      .populateFooter(ctx)
      .populateFooter(ctx)
      .insertName(ctx)
      .insertEmptyLine(ctx)
      .insertSummary(ctx)
      .insertEmptyLine(ctx)
      .insertTechnology(ctx)
      .insertEmptyLine(ctx)
      .insertCertification(ctx)
      .insertEmptyLine(ctx)
      .insertEmptyLine(ctx)
      .insertWorkExperience(ctx);

    await ctx.sync();
  }

  private insertEmptyLine(context: Word.RequestContext): AppComponent {
    context.document.body.insertParagraph('', Word.InsertLocation.end).set(this.normalParagraph);

    return this;
  }

  private populateHeader(context: Word.RequestContext): AppComponent {
    const header = context.document.sections.getFirst().getHeader(Word.HeaderFooterType.primary);
    header.clear();
    header.insertInlinePictureFromBase64(headerLogo, Word.InsertLocation.start);

    return this;
  }

  private populateFooter(context: Word.RequestContext): AppComponent {
    const footer = context.document.sections.getFirst().getFooter(Word.HeaderFooterType.primary);
    footer.clear();
    footer.insertInlinePictureFromBase64(footerLogo, Word.InsertLocation.start);

    return this;
  }

  private insertName(context: Word.RequestContext): AppComponent {
    const table: Word.Table = context.document.body.insertTable(1, 2, Word.InsertLocation.start);
    const border = table.getBorder(Word.BorderLocation.all);
    const firstColumn = table.getCellOrNullObject(0, 0);
    const secondColumn = table.getCellOrNullObject(0, 1);
    const p: Word.Paragraph = firstColumn.body.insertParagraph('<User Name>', Word.InsertLocation.start);
    const imgPlaceholder: Word.Paragraph = secondColumn.body.insertParagraph(' ', Word.InsertLocation.start);

    border.set({type: Word.BorderType.none});

    p.set({
      styleBuiltIn: Word.Style.title
    });
    imgPlaceholder.set({
      alignment: Word.Alignment.right
    });
    this.wordService.createContentControl(p, contentControls.userName);
    this.wordService.createContentControl(imgPlaceholder, contentControls.photo);

    return this;
  }

  private insertSummary(context: Word.RequestContext): AppComponent {
    const heading = context.document.body.insertParagraph('Summary of experience:', Word.InsertLocation.end);
    const text = heading.insertParagraph('<Years> years in IT', Word.InsertLocation.after);
    const list = text.insertParagraph('<Description>', Word.InsertLocation.after);

    list.startNewList();
    this.wordService.createContentControl(list, contentControls.experienceSummary);

    heading.set(this.titleParagraph);
    text.set(this.normalParagraph);
    list.set(this.normalParagraph);

    return this;
  }

  private insertTechnology(context: Word.RequestContext): AppComponent {
    const title = context.document.body.insertParagraph('Technology/Methodology:', Word.InsertLocation.end);
    const table = title.insertTable(1, 4, Word.InsertLocation.after, [['<Group 1>', '<Group 2>', '<Group 3>', '<Group 4>']]);
    const border = table.getBorder(Word.BorderLocation.outside);
    this.wordService.createContentControl(table, contentControls.technologies);

    title.set(this.titleParagraph);
    table.set(Object.assign({}, this.normalParagraph, {alignment: Word.Alignment.centered}));
    border.set({type: Word.BorderType.none});

    return this;
  }

  private insertCertification(context: Word.RequestContext): AppComponent {
    const title = context.document.body.insertParagraph('Certification:', Word.InsertLocation.end);
    const list  = title.insertParagraph('<Certificate>', Word.InsertLocation.after);

    list.startNewList();
    this.wordService.createContentControl(list, contentControls.certifications);

    title.set(this.titleParagraph);
    list.set(this.normalParagraph);

    return this;
  }

  private async insertWorkExperience(context: Word.RequestContext): Promise<AppComponent> {
    const title = context.document.body.insertParagraph('Work experience:', Word.InsertLocation.end);
    const table = title.insertTable(1, 2, Word.InsertLocation.after);
    const border = table.getBorder(Word.BorderLocation.all);

    this.wordService.createContentControl(table, contentControls.workExperience);

    title.set(Object.assign({}, this.titleParagraph, {
      font: { size: 14, bold: true },
      alignment: Word.Alignment.centered
    }));
    table.set(this.normalParagraph);
    border.set({type: Word.BorderType.none});

    const firstColumn = table.getCellOrNullObject(0, 0);
    const companyName = firstColumn.body.insertParagraph('<Company Name>', Word.InsertLocation.start);
    const period = companyName.insertParagraph('<period>', Word.InsertLocation.after);

    companyName.set(Object.assign({}, this.normalParagraph, { font: {size: 10, bold: true} }));
    period.set(Object.assign({}, this.normalParagraph, { font: {size: 10, italic: true} }));

    const secondColumn = table.getCellOrNullObject(0, 1);
    const position = secondColumn.body.insertParagraph('<Your position>', Word.InsertLocation.start);
    const list = position.insertParagraph('<Short description>', Word.InsertLocation.after);

    list.startNewList();

    position.set(Object.assign({}, this.normalParagraph, { font: {size: 10, bold: true} }));
    list.set(this.normalParagraph);

    return this;
  }

}
