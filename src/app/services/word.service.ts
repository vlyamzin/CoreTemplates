import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  constructor(
  ) {
  }

  public async getContext(): Promise<Word.RequestContext> {
    return await Word.run(async (context) => {
      return context;
    });
  }

  public getControls(context: Word.RequestContext, tags: string[]): any {
    const controls = {};

    tags.forEach(tag => {
      controls[tag] = context.document.contentControls.getByTag(tag);
      controls[tag].load('text, tag');
    });

    return controls;
  }

  public updateHeaderColor(color: string, titleBkgColor?: string) {
    Word.run(async (context) => {
      const headerTable  = context.document.sections.getFirst().getHeader('FirstPage').tables.getFirst();
      headerTable.load('shadingColor');

      const firstCell = headerTable.getCell(0, 0);
      firstCell.load('shadingColor');

      await context.sync();

      headerTable.shadingColor = color;
      firstCell.shadingColor = titleBkgColor || '#990000';

      await context.sync();
    });
  }

  public setControlText(control: Word.ContentControlCollection, value: string) {
    if (control) {
      control.items.forEach((item) => {
        item.insertText(value, Word.InsertLocation.replace);
      });
    }
  }

  public setControlXML(control: Word.ContentControlCollection, value: string, position?: Word.InsertLocation) {
    if (control && control.items.length) {
      const plase = position || Word.InsertLocation.replace;
      control.items[0].insertOoxml(value, plase);
    }
  }

  public setControlHTML(control: Word.ContentControlCollection, value: string) {
    if (control && control.items.length) {
      control.items[0].insertHtml(value, 'Replace');
    }
  }

  public resetControl(control: Word.ContentControlCollection) {
    if (control && control.items.length) {
      control.items.forEach(item => item.insertHtml('&nbsp;', 'Replace'));
    }
  }

  public async resetTags(tags: string[]): Promise<void> {
    const context = await this.getContext();
    const controls = this.getControls(context, tags);

    await context.sync();

    tags.forEach(tag => this.resetControl(controls[tag]));

    await context.sync();
  }

  public setCellText(control: Word.ContentControlCollection, rowIndex: number, cellIndex: number, value: string): void {
    if (control) {
      const cell = control.items[0].tables.getFirst().getCell(rowIndex, cellIndex);

      if (cell) {
        cell.value = value;
      }
    }
  }

  public async select(tag: string, selectionMode = Word.SelectionMode.select) {
    const context = await this.getContext();
    const control = context.document.contentControls.getByTag(tag).getFirstOrNullObject();

    if (control) {
      control.select(selectionMode);
      await context.sync();
    }
  }

  private async getFile(fileType: Office.FileType): Promise<Office.File> {
    return new Promise<Office.File>((resolve, reject) => {
      Office.context.document.getFileAsync(fileType, { sliceSize: 4 * 1024 * 1024 /*4 MB*/ },
        (result: Office.AsyncResult<Office.File>) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve(result.value);
          } else {
            reject('getFileAsync Error: ' + result.error.message);
          }
      });
    });
  }

  private async getSlice(file: Office.File, index: number): Promise<Office.Slice> {
    return new Promise<Office.Slice>((resolve, reject) => {
      file.getSliceAsync(index, (sliceResult: Office.AsyncResult<Office.Slice>) => {
        if (sliceResult.status === Office.AsyncResultStatus.Succeeded) {
          resolve(sliceResult.value);
        } else {
          reject('getSliceAsync Error :' + sliceResult.error.message);
        }
      });
    });
  }

  public async getDocument(fileType: Office.FileType): Promise<Blob> {
    const file = await this.getFile(fileType);
    const sliceCount = file.sliceCount;

    try {
      // Get the file slices
      const slices = [];
      for (let i = 0; i < sliceCount; i++) {
        slices.push(this.getSlice(file, i));
      }

      const receivedSlices = await Promise.all(slices);
      const sliceData = receivedSlices.map(slice => slice.data);

      let docdata = [];
      for (let i = 0; i < sliceData.length; i++) {
          docdata = docdata.concat(sliceData[i]);
      }
      return new Blob([new Uint8Array(docdata)]);
    } finally {
      file.closeAsync();
    }
  }

  public async setAppearance(tags: string[], appearance: Word.ContentControlAppearance): Promise<void> {
    const context = await this.getContext();
    const controls = this.getControls(context, tags);

    await context.sync();

    tags.forEach(tag => {
      const control = controls[tag];

      if (control && control.items.length) {
        control.items[0].appearance = appearance;
      }
    });

    await context.sync();
  }

  public createContentControl(body: any, id: string): Word.ContentControl {
    const cc = body.insertContentControl();

    cc.tag = id;
    cc.title = id;
    cc.appearance = Word.ContentControlAppearance.hidden;

    return cc;
  }

}
