import { Component, OnInit } from '@angular/core';
import {TypeaheadMatch} from 'ngx-bootstrap';
import {HttpClient} from '@angular/common/http';
import {MetadataService} from '../services/metadata.service';
import {CoreBaseService} from '../services/core-base.service';

@Component({
  selector: 'app-core-base',
  templateUrl: './core-base.component.html',
  styleUrls: ['./core-base.component.scss']
})
export class CoreBaseComponent implements OnInit{
  selectedUser: string;
  typeaheadLoading: boolean;

  constructor(private http: HttpClient,
              private metadata: MetadataService,
              private coreBase: CoreBaseService) { }

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
    this.coreBase.getUserById(id)
      .subscribe(res => {
        console.log(res);
      });
  }

  get users() {
    return this.coreBase.getUsers(this.selectedUser);
  }

}
