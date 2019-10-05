import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreBaseComponent } from './core-base.component';

describe('CoreBaseComponent', () => {
  let component: CoreBaseComponent;
  let fixture: ComponentFixture<CoreBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoreBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoreBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
