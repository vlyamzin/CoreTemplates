import {Injectable} from '@angular/core';
import {WordService} from './word.service';
import {DatePipe} from '@angular/common';

export enum DocumentProperty {
  Author = 'author',
  Category = 'category',
  Comments = 'comments',
  Company = 'company',
  Format = 'format',
  Keywords = 'keywords',
  Manager = 'manager',
  Subject = 'subject',
  Title = 'title',
}

@Injectable()
export class MetadataService {

  constructor(
    private wordService: WordService,
  ) { }

  public async getItem(name: string): Promise<any> {
    const context = await this.wordService.getContext();
    const lengthProperty = context.document.properties.customProperties.getItemOrNullObject(this.prefix(name + '_length'));
    const shortProperty = context.document.properties.customProperties.getItemOrNullObject(this.prefix(name));

    context.load(lengthProperty);
    context.load(shortProperty);

    await context.sync();

    if (lengthProperty && lengthProperty.value > 0) {
      const properties = [];
      for (let i = 0; i < lengthProperty.value; i++) {
        properties[i] = context.document.properties.customProperties.getItemOrNullObject(this.prefix(name + i));
        context.load(properties[i]);
      }
      await context.sync();
      return properties.map(property => property.value).join('');
    }
    return shortProperty.value;
  }

  public async setItem(name: string, value: string): Promise<void> {
    const context = await this.wordService.getContext();
    const properties = context.document.properties.customProperties;

    context.load(properties);
    await context.sync();

    this._setItem(name, value, properties);

    await context.sync();
  }

  public async setItems(values: { [name: string]: string }): Promise<void> {
    const context = await this.wordService.getContext();
    const properties = context.document.properties.customProperties;

    context.load(properties);
    await context.sync();

    Object.keys(values).forEach(name => this._setItem(name, values[name], properties));

    await context.sync();
  }

  public async removeItems(names: string[]): Promise<void> {
    const values = {};

    names.forEach(name => values[name] = '');
    await this.setItems(values);
  }

  public async removeAllItems(): Promise<void> {
    const context = await this.wordService.getContext();
    const properties = context.document.properties.customProperties;

    properties.deleteAll();
    await context.sync();
  }

  public async getItemAsJson(name: string): Promise<any> {
    const string = await this.getItem(name);

    try {
      return JSON.parse(string);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public setItemAsJson(name: string, value: any): Promise<void> {
    return this.setItem(name, JSON.stringify(value));
  }

  public removeItem(name: string): Promise<void> {
    return this.setItem(name, '');
  }

  public async clearAll() {
    await Word.run(async (context) => {
      const props = context.document.properties.customProperties;
      context.load(props);

      await context.sync();

      props.deleteAll();

      await context.sync();
    });
  }

  private prefix(name: string): string {
    return '___' + name;
  }

  private chunkString(str: string, size: number): string[] {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }

    return chunks;
  }

  private _setItem(name: string, value: string, properties: Word.CustomPropertyCollection) {
    if (value.length > 255) {
      const chunks = this.chunkString(value, 255);
      chunks.forEach((chunk, index) => properties.add(this.prefix(name + index), chunk));
      properties.add(this.prefix(name + '_length'), chunks.length);
    } else {
      properties.add(this.prefix(name), value);
      properties.add(this.prefix(name + '_length'), 0);
    }
  }
}
