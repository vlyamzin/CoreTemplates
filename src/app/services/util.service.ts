import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class UtilService {

  constructor(
  ) { }

  /**
   * Intersect two arrays
   * Returns new array that contains elements which are present in both arrays
   */
  public static intersect<T>(a: Array<T>, b: Array<T>): Array<T> {
    const setA = new Set<T>(a);
    const _intersection = new Set<T>();

    for (const elem of b) {
      if (setA.has(elem)) {
        _intersection.add(elem);
      }
    }
    return Array.from(_intersection);
  }

  /**
   * Subtract two arrays
   * Returns new array that contains elements which are present in a without items in b
   */
  public static subtract<T>(a: Array<T>, b: Array<T>): Array<T> {
    const result = new Set<T>(a);

    for (const elem of b) {
      if (result.has(elem)) {
        result.delete(elem);
      }
    }
    return Array.from(result);
  }

  public static isNullOrUndefined(value: any): boolean {
    return (value === null || value === undefined);
  }

  public static isZeroOrUndefined(value): number | undefined {
    return value === 0 ? 0 : undefined;
  }

  public static getArrayOfLength<T>(length: number, value?: T): Array<T> {
    if (length > 0) {
      const arr = new Array(length);
      return value ? arr.fill(value) : arr;
    }

    return [];
  }

  public trimKeyword(keyword: string): string {
    return keyword && keyword.trim() || '';
  }

  public checkMinLength(keyword: string, minLength: number = 2): boolean {
    return keyword.length >= minLength;
  }

  public isTrue(value: any): boolean {
    return value === 'true' || value === true || value === 'Y' || value === 'Yes';
  }

  public blobToBase64(blob: Blob): Promise<string> {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      try {
        reader.addEventListener('loadend', () => {
          const input = reader.result;
          const separator = 'base64,';

          if (input && typeof input === 'string') {
            const result = input.substr(input.indexOf(separator) + separator.length);
            resolve(result);
          } else {
            reject('Parse error');
          }
        }, false);
        reader.readAsDataURL(blob);
      } catch (e) {
        console.log('UtilService: blobToBase64 file loading error', e);
        reject(e);
      }
    });
  }

  public chartBlobToBase64(blob: Blob): Observable<string> {
    return Observable.create(observer => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const res = reader.result.toString().split('data:image/png;base64,').pop();
        observer.next(res);
        observer.complete();
      };
      reader.onerror = (e) => {
        console.log('UtilService: blobToBase64 file loading error', e);
        observer.complete();
      };
    });
  }

  public isObject(obj: any): boolean {
    return obj && typeof obj === 'object';
  }

  /**
   * Performs a deep merge of objects and returns new object. Does not modify
   * objects (immutable) and merges arrays via concatenation.
   *
   * From version 1.19.2 the logic for arrays changed. In case both arrays have
   * objects with at least one similar key/value pair, these objects will be merged into one.
   *
   * @param {...object} objects - Objects to merge
   * @returns {object} New object with merged key/values
   */
  public mergeDeep(...objects): any {
    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = this.unique(this.combineSimilarObjects(pVal, oVal));
        } else if (this.isObject(pVal) && this.isObject(oVal)) {
          prev[key] = this.mergeDeep(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    }, {});
  }

  public unique<T>(arr: T[]): T[] {
    return Array.from(new Set<T>(arr));
  }

  /**
   * Run through the array and merge objects which have similar mergeId value pair
   * If mergeId is absent in the object body, the item is ignored.
   * */
  private combineSimilarObjects<T>(pArr: Array<T>, oArr: Array<T>): Array<T> {
    if (!this.isObject(pArr[0]) || !this.isObject(oArr[0])) {
      return pArr.concat(...oArr);
    }

    const res = [];
    pArr.forEach((pVal) => {
      const mergeId = pVal['mergeId'];

      if (mergeId) {
        const toMergeIndex = oArr.findIndex(oVal => oVal[mergeId] === pVal[mergeId]);
        if (toMergeIndex >= 0) {
          pVal = this.mergeDeep(pVal, oArr[toMergeIndex]);
          oArr.splice(toMergeIndex, 1);
          delete (pVal['mergeId']);
        }
      }
      res.push(pVal);
    });

    return [...res, ...oArr];
  }

  public createObject<T>(source: T, attrName: string, attrValues: (keyof T)[]): Record<string, { [K in keyof T]: T[K] }> {
    return {
      [attrName]: attrValues.reduce((attrs, value) => {
        if (source.hasOwnProperty(value)) {
          return Object.assign(attrs, { [value]: source[value] });
        }
      }, {} as any)
    };
  }


}
