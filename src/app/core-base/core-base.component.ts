import { Component, OnInit } from '@angular/core';
import {TypeaheadMatch} from 'ngx-bootstrap';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {MetadataService} from '../services/metadata.service';

@Component({
  selector: 'app-core-base',
  templateUrl: './core-base.component.html',
  styleUrls: ['./core-base.component.scss']
})
export class CoreBaseComponent implements OnInit{
  selectedUser: string;
  typeaheadLoading: boolean;

  constructor(private http: HttpClient,
              private metadata: MetadataService) { }

  async ngOnInit(): Promise<void> {
    const userName = await this.metadata.getItem('user');

    if (userName) {
      this.selectedUser = userName;
    }
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    const id = e.item.id;

    this.metadata.setItem('user', e.value);
    this.http.get(`${environment.api}/core-base/info`, { params: { id }})
      .subscribe(res => {
        console.log(res);
      });
  }

  get users() {
    return this.http.get(`${environment.api}/core-base/lookup?keyword=${this.selectedUser}`).pipe(
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

}
